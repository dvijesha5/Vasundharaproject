from django.db import models
from businesses.models import Business

class Sale(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='sales')
    date = models.DateField(db_index=True)
    product_name = models.CharField(max_length=255, db_index=True)
    customer_code = models.CharField(max_length=100, blank=True, default='C000', db_index=True)
    region = models.CharField(max_length=100, default='General', db_index=True)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['business', 'date']),
        ]


    def __str__(self):
        return f"{self.date} - {self.product_name} ({self.total_amount})"
