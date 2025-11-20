from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class User(AbstractUser):
    ROLE_CHOICES = [
        ('staff', 'Staff'),
        ('approver_level_1', 'Approver Level 1'),
        ('approver_level_2', 'Approver Level 2'),
        ('finance', 'Finance'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    
    class Meta:
        db_table = 'users'

class PurchaseRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Relations
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    
    # Files
    proforma = models.FileField(upload_to='proformas/', null=True, blank=True)
    purchase_order = models.FileField(upload_to='purchase_orders/', null=True, blank=True)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # Extracted data from proforma
    vendor_name = models.CharField(max_length=255, blank=True)
    extracted_items = models.JSONField(default=list, blank=True)
    
    # Receipt validation
    receipt_validated = models.BooleanField(default=False)
    validation_errors = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'purchase_requests'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.status}"

class Approval(models.Model):
    ACTION_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    request = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approvals_given')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    level = models.IntegerField()  # 1 or 2
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approvals'
        ordering = ['created_at']
        unique_together = ['request', 'level']
        
    def __str__(self):
        return f"{self.approver.username} - {self.action} - Level {self.level}"