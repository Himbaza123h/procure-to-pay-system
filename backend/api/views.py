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


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
    
    def list(self, request, *args, **kwargs):
        """List purchase requests with custom response format"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({
                    'success': True,
                    'message': 'Purchase requests retrieved successfully',
                    'data': serializer.data
                })
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'message': 'Purchase requests retrieved successfully',
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to retrieve purchase requests',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single purchase request with custom response format"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                'success': True,
                'message': 'Purchase request retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        except PermissionError:
            return Response({
                'success': False,
                'message': 'You do not have permission to view this purchase request',
                'error': 'permission_denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Purchase request not found',
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request, *args, **kwargs):
        """Create purchase request with custom response format"""
        try:
            response = super().create(request, *args, **kwargs)
            return Response({
                'success': True,
                'message': 'Purchase request created successfully',
                'data': response.data
            }, status=status.HTTP_201_CREATED)
        except PermissionError as e:
            return Response({
                'success': False,
                'message': str(e),
                'error': 'permission_denied'
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to create purchase request',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        # Only staff can create requests
        if self.request.user.role != 'staff':
            raise PermissionError("Only staff members can create purchase requests")
        
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
        """Update purchase request with custom response format"""
        instance = self.get_object()
        
        # Only owner can update
        if instance.created_by != request.user:
            return Response({
                'success': False,
                'message': 'You can only update your own purchase requests',
                'error': 'permission_denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Only pending requests can be updated
        if instance.status != 'pending':
            return Response({
                'success': False,
                'message': f'Cannot update {instance.status} requests. Only pending requests can be modified',
                'error': 'invalid_status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            response = super().update(request, *args, **kwargs)
            return Response({
                'success': True,
                'message': 'Purchase request updated successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to update purchase request',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a purchase request with custom response format"""
        try:
            instance = self.get_object()
            
            # Only owner can delete
            if instance.created_by != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only delete your own purchase requests',
                    'error': 'permission_denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Only pending requests can be deleted
            if instance.status != 'pending':
                return Response({
                    'success': False,
                    'message': f'Cannot delete {instance.status} requests. Only pending requests can be deleted',
                    'error': 'invalid_status'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            instance.delete()
            return Response({
                'success': True,
                'message': 'Purchase request deleted successfully'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to delete purchase request',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, CanApproveRequest])
    def approve(self, request, pk=None):
        return self._handle_approval(request, pk, 'approve')
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, CanApproveRequest])
    def reject(self, request, pk=None):
        return self._handle_approval(request, pk, 'reject')
    
    @transaction.atomic
    def _handle_approval(self, request, pk, action_type):
        try:
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
                    'success': True,
                    'message': f'Purchase request rejected by Level {level} approver',
                    'data': {
                        'request': PurchaseRequestSerializer(purchase_request).data,
                        'approval': {
                            'level': level,
                            'action': 'rejected',
                            'approver': user.get_full_name() or user.username,
                            'comments': approval.comments
                        }
                    }
                }, status=status.HTTP_200_OK)
            
            # Check if all approvals are complete
            approvals = purchase_request.approvals.filter(action='approved')
            if approvals.count() == 2:  # Both levels approved
                purchase_request.status = 'approved'
                purchase_request.approved_at = timezone.now()
                
                # Generate Purchase Order
                po_generated = False
                try:
                    po_file = generate_purchase_order(purchase_request)
                    purchase_request.purchase_order = po_file
                    po_generated = True
                except Exception as e:
                    print(f"Error generating PO: {e}")
                
                purchase_request.save()
                
                return Response({
                    'success': True,
                    'message': 'Purchase request fully approved. Purchase order has been generated',
                    'data': {
                        'request': PurchaseRequestSerializer(purchase_request).data,
                        'approval': {
                            'level': level,
                            'action': 'approved',
                            'approver': user.get_full_name() or user.username,
                            'comments': approval.comments
                        },
                        'po_generated': po_generated
                    }
                }, status=status.HTTP_200_OK)
            
            purchase_request.save()
            
            return Response({
                'success': True,
                'message': f'Level {level} approval recorded successfully. Awaiting Level {3-level} approval',
                'data': {
                    'request': PurchaseRequestSerializer(purchase_request).data,
                    'approval': {
                        'level': level,
                        'action': 'approved',
                        'approver': user.get_full_name() or user.username,
                        'comments': approval.comments
                    },
                    'next_step': f'Requires Level {3-level} approval'
                }
            }, status=status.HTTP_200_OK)
        
        except PermissionError as e:
            return Response({
                'success': False,
                'message': 'You do not have permission to perform this action',
                'error': 'permission_denied'
            }, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to {action_type} purchase request',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_receipt(self, request, pk=None):
        try:
            purchase_request = self.get_object()
            
            # Only owner can submit receipt
            if purchase_request.created_by != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only submit receipts for your own purchase requests',
                    'error': 'permission_denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Request must be approved
            if purchase_request.status != 'approved':
                return Response({
                    'success': False,
                    'message': f'Cannot submit receipt for {purchase_request.status} requests. Only approved requests can have receipts',
                    'error': 'invalid_status'
                }, status=status.HTTP_400_BAD_REQUEST)
            
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
                
                if validation_result['is_valid']:
                    return Response({
                        'success': True,
                        'message': 'Receipt uploaded and validated successfully',
                        'data': {
                            'request': PurchaseRequestSerializer(purchase_request).data,
                            'validation': validation_result
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'message': 'Receipt uploaded but validation failed',
                        'data': {
                            'request': PurchaseRequestSerializer(purchase_request).data,
                            'validation': validation_result
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Receipt uploaded but validation process encountered an error',
                    'error': str(e),
                    'data': {
                        'request': PurchaseRequestSerializer(purchase_request).data
                    }
                }, status=status.HTTP_206_PARTIAL_CONTENT)
        
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to upload receipt',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)