from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import PurchaseRequest, Approval
from .serializers import (
    PurchaseRequestSerializer,
    PurchaseRequestCreateSerializer,
    ApprovalActionSerializer,
    ReceiptUploadSerializer
)
from .permissions import (
    IsStaff,
    IsApprover,
    IsFinance,
    CanApproveRequest,
    CanViewRequest
)

# Import AI services
from services.document_processor import process_proforma
from services.po_generator import generate_purchase_order
from services.receipt_validator import validate_receipt

class PurchaseRequestViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PurchaseRequestCreateSerializer
        return PurchaseRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = PurchaseRequest.objects.all()
        
        # Staff can only see their own requests
        if user.role == 'staff':
            queryset = queryset.filter(created_by=user)
        
        # Approvers can see all requests
        elif user.role in ['approver_level_1', 'approver_level_2']:
            queryset = queryset.all()
        
        # Finance can see approved requests
        elif user.role == 'finance':
            queryset = queryset.filter(status='approved')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only staff can create requests
        if self.request.user.role != 'staff':
            raise PermissionError("Only staff members can create requests")
        
        request = serializer.save(created_by=self.request.user)
        
        # Process proforma if uploaded
        if request.proforma:
            try:
                extracted_data = process_proforma(request.proforma.path)
                request.vendor_name = extracted_data.get('vendor_name', '')
                request.extracted_items = extracted_data.get('items', [])
                request.save()
            except Exception as e:
                print(f"Error processing proforma: {e}")
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Only owner can update
        if instance.created_by != request.user:
            return Response(
                {'error': 'You can only update your own requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only pending requests can be updated
        if instance.status != 'pending':
            return Response(
                {'error': 'Cannot update approved or rejected requests'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, CanApproveRequest])
    def approve(self, request, pk=None):
        return self._handle_approval(request, pk, 'approve')
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, CanApproveRequest])
    def reject(self, request, pk=None):
        return self._handle_approval(request, pk, 'reject')
    
    @transaction.atomic
    def _handle_approval(self, request, pk, action_type):
        purchase_request = self.get_object()
        serializer = ApprovalActionSerializer(data={'action': action_type, **request.data})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Determine approval level
        level = 1 if user.role == 'approver_level_1' else 2
        
        # Create approval record
        approval = Approval.objects.create(
            request=purchase_request,
            approver=user,
            action='approved' if action_type == 'approve' else 'rejected',
            level=level,
            comments=serializer.validated_data.get('comments', '')
        )
        
        # Update request status
        if action_type == 'reject':
            purchase_request.status = 'rejected'
            purchase_request.rejected_at = timezone.now()
            purchase_request.save()
            
            return Response({
                'message': 'Request rejected successfully',
                'request': PurchaseRequestSerializer(purchase_request).data
            })
        
        # Check if all approvals are complete
        approvals = purchase_request.approvals.filter(action='approved')
        if approvals.count() == 2:  # Both levels approved
            purchase_request.status = 'approved'
            purchase_request.approved_at = timezone.now()
            
            # Generate Purchase Order
            try:
                po_file = generate_purchase_order(purchase_request)
                purchase_request.purchase_order = po_file
            except Exception as e:
                print(f"Error generating PO: {e}")
            
            purchase_request.save()
            
            return Response({
                'message': 'Request fully approved and PO generated',
                'request': PurchaseRequestSerializer(purchase_request).data
            })
        
        purchase_request.save()
        
        return Response({
            'message': f'Level {level} approval recorded',
            'request': PurchaseRequestSerializer(purchase_request).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_receipt(self, request, pk=None):
        purchase_request = self.get_object()
        
        # Only owner can submit receipt
        if purchase_request.created_by != request.user:
            return Response(
                {'error': 'You can only submit receipts for your own requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Request must be approved
        if purchase_request.status != 'approved':
            return Response(
                {'error': 'Can only submit receipts for approved requests'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReceiptUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        receipt_file = serializer.validated_data['receipt']
        purchase_request.receipt = receipt_file
        purchase_request.save()
        
        # Validate receipt against PO
        try:
            validation_result = validate_receipt(
                receipt_file.path,
                purchase_request
            )
            purchase_request.receipt_validated = validation_result['is_valid']
            purchase_request.validation_errors = validation_result.get('errors', [])
            purchase_request.save()
            
            return Response({
                'message': 'Receipt uploaded and validated',
                'validation': validation_result,
                'request': PurchaseRequestSerializer(purchase_request).data
            })
        except Exception as e:
            return Response({
                'message': 'Receipt uploaded but validation failed',
                'error': str(e),
                'request': PurchaseRequestSerializer(purchase_request).data
            }, status=status.HTTP_206_PARTIAL_CONTENT)
