from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('businesses', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dataset_type', models.CharField(choices=[('SALES', 'Sales Data'), ('EXPENSES', 'Expenses Data')], max_length=20)),
                ('file_name', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('PROCESSING', 'Processing'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING', max_length=20)),
                ('total_records', models.IntegerField(default=0)),
                ('valid_records', models.IntegerField(default=0)),
                ('duplicates_removed', models.IntegerField(default=0)),
                ('missing_handled', models.IntegerField(default=0)),
                ('quality_score', models.FloatField(default=100.0)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='datasets', to='businesses.business')),
            ],
            options={
                'ordering': ['-uploaded_at'],
            },
        ),
    ]
