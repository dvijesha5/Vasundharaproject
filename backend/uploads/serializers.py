from rest_framework import serializers
from .models import Dataset

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('id', 'business', 'dataset_type', 'file_name', 'status', 'total_records', 'valid_records', 'duplicates_removed', 'missing_handled', 'quality_score', 'error_message', 'uploaded_at')
        read_only_fields = ('id', 'business', 'status', 'total_records', 'valid_records', 'duplicates_removed', 'missing_handled', 'quality_score', 'error_message', 'uploaded_at')
