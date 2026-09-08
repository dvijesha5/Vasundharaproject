from django.db import models
from businesses.models import Business

class Expense(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField(db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['business', 'date']),
        ]


    def __str__(self):
        return f"{self.date} - {self.category} ({self.amount})"
