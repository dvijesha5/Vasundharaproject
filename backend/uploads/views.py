from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from businesses.permissions import IsBusinessMember
from .models import Dataset
from .serializers import DatasetSerializer
from .cleaners import process_sales_csv, process_expenses_csv

class CSVUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsBusinessMember]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        dataset_type = request.data.get('dataset_type', '').upper()

        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        if dataset_type not in ('SALES', 'EXPENSES'):
            return Response({'error': 'Invalid dataset_type. Must be SALES or EXPENSES.'}, status=status.HTTP_400_BAD_REQUEST)

        dataset = Dataset.objects.create(
            business=request.business,
            dataset_type=dataset_type,
            file_name=file_obj.name,
            status='PROCESSING'
        )

        try:
            if dataset_type == 'SALES':
                stats = process_sales_csv(file_obj, request.business)
            else:
                stats = process_expenses_csv(file_obj, request.business)

            dataset.status = 'COMPLETED'
            dataset.total_records = stats['total_records']
            dataset.valid_records = stats['valid_records']
            dataset.duplicates_removed = stats['duplicates_removed']
            dataset.missing_handled = stats['missing_handled']
            dataset.quality_score = stats['quality_score']
            dataset.save()

            return Response({
                'message': 'Dataset imported and cleaned successfully.',
                'dataset': DatasetSerializer(dataset).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            dataset.status = 'FAILED'
            dataset.error_message = str(e)
            dataset.save()
            return Response({'error': str(e), 'dataset': DatasetSerializer(dataset).data}, status=status.HTTP_400_BAD_REQUEST)

class DatasetListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsBusinessMember]
    serializer_class = DatasetSerializer

    def get_queryset(self):
        return Dataset.objects.filter(business=self.request.business)
