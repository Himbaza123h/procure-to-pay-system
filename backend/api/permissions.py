from rest_framework import permissions

class IsStaff(permissions.BasePermission):
    """Allow only staff users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'

class IsApprover(permissions.BasePermission):
    """Allow only approver users"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['approver_level_1', 'approver_level_2']
        )

class IsFinance(permissions.BasePermission):
    """Allow only finance users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'finance'

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, others can only read"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

class CanApproveRequest(permissions.BasePermission):
    """Check if user can approve the request based on level"""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Must be an approver
        if user.role not in ['approver_level_1', 'approver_level_2']:
            return False
        
        # Request must be pending
        if obj.status != 'pending':
            return False
        
        # Check approval level
        existing_approvals = obj.approvals.all()
        
        # Level 1 approver
        if user.role == 'approver_level_1':
            # Can approve if no level 1 approval exists
            return not existing_approvals.filter(level=1).exists()
        
        # Level 2 approver
        if user.role == 'approver_level_2':
            # Can approve only if level 1 is approved
            level_1_approved = existing_approvals.filter(
                level=1, 
                action='approved'
            ).exists()
            level_2_exists = existing_approvals.filter(level=2).exists()
            return level_1_approved and not level_2_exists
        
        return False

class CanViewRequest(permissions.BasePermission):
    """Determine who can view a request"""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Owner can always view
        if obj.created_by == user:
            return True
        
        # Approvers can view pending and their reviewed requests
        if user.role in ['approver_level_1', 'approver_level_2']:
            return True
        
        # Finance can view approved requests
        if user.role == 'finance':
            return obj.status == 'approved'
        
        return False