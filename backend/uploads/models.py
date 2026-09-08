from django.db import models
from businesses.models import Business

class Dataset(models.Model):
    TYPE_CHOICES = (
        ('SALES', 'Sales Data'),
        ('EXPENSES', 'Expenses Data'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='datasets')
    dataset_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_records = models.IntegerField(default=0)
    valid_records = models.IntegerField(default=0)
    duplicates_removed = models.IntegerField(default=0)
    missing_handled = models.IntegerField(default=0)
    quality_score = models.FloatField(default=100.0)
    error_message = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.business.name} - {self.file_name} ({self.status})"
