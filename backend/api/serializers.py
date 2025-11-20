from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PurchaseRequest, Approval

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']

class ApprovalSerializer(serializers.ModelSerializer):
    approver = UserSerializer(read_only=True)
    
    class Meta:
        model = Approval
        fields = ['id', 'approver', 'action', 'level', 'comments', 'created_at']
        read_only_fields = ['id', 'created_at']

class PurchaseRequestSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    approvals = ApprovalSerializer(many=True, read_only=True)
    proforma = serializers.FileField(required=False)
    receipt = serializers.FileField(required=False)
    
    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'title', 'description', 'amount', 'status',
            'created_by', 'proforma', 'purchase_order', 'receipt',
            'vendor_name', 'extracted_items', 'receipt_validated',
            'validation_errors', 'approvals', 'created_at', 
            'updated_at', 'approved_at', 'rejected_at'
        ]
        read_only_fields = [
            'id', 'status', 'purchase_order', 'vendor_name', 
            'extracted_items', 'receipt_validated', 'validation_errors',
            'created_at', 'updated_at', 'approved_at', 'rejected_at'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value
    
    def validate(self, data):
        # Only allow updates if status is pending
        if self.instance and self.instance.status != 'pending':
            raise serializers.ValidationError(
                "Cannot modify request that has been approved or rejected"
            )
        return data

class PurchaseRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseRequest
        fields = ['title', 'description', 'amount', 'proforma']
        
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value

class ApprovalActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    comments = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['action'] == 'reject' and not data.get('comments'):
            raise serializers.ValidationError({
                'comments': 'Comments are required when rejecting a request'
            })
        return data

class ReceiptUploadSerializer(serializers.Serializer):
    receipt = serializers.FileField()
    
    def validate_receipt(self, value):
        # Validate file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only PDF and image files (JPEG, PNG) are allowed"
            )
        
        return value