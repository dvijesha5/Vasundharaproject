import pandas as pd
import numpy as np
from django.db import transaction
from sales.models import Sale
from expenses.models import Expense
from products.models import Product
from customers.models import Customer
from .validators import validate_csv_columns

def process_sales_csv(file_obj, business):
    df = pd.read_csv(file_obj)
    df.columns = df.columns.str.strip()
    validate_csv_columns(df, 'SALES')

    total_records = len(df)
    if total_records == 0:
        raise ValueError("Uploaded CSV is empty.")

    # 1. Deduplication
    initial_len = len(df)
    df = df.drop_duplicates()
    duplicates_removed = initial_len - len(df)

    # 2. Clean Strings
    df['Product'] = df['Product'].astype(str).str.strip()
    df['Customer'] = df['Customer'].astype(str).str.strip()
    df['Region'] = df['Region'].astype(str).str.strip()

    # 3. Numeric Coercion
    df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce')
    df['Revenue'] = pd.to_numeric(df['Revenue'], errors='coerce')

    # 4. Date Coercion
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')

    # 5. Drop Invalid Rows
    missing_handled = df[['Date', 'Revenue', 'Quantity']].isna().sum().sum()
    df = df.dropna(subset=['Date', 'Revenue', 'Quantity'])
    df = df[(df['Revenue'] >= 0) & (df['Quantity'] > 0)]

    valid_records = len(df)
    quality_score = round((valid_records / total_records) * 100, 1) if total_records > 0 else 0.0

    # 6. Database Import Transaction
    sales_objs = []
    products_to_ensure = set()
    customers_to_ensure = set()

    for idx, row in df.iterrows():
        product_name = row['Product']
        customer_code = row['Customer']
        region = row['Region'] if row['Region'] != 'nan' else 'General'
        qty = int(row['Quantity'])
        rev = float(row['Revenue'])
        unit_price = round(rev / qty, 2) if qty > 0 else rev

        products_to_ensure.add(product_name)
        customers_to_ensure.add((customer_code, region))

        sales_objs.append(Sale(
            business=business,
            date=row['Date'].date(),
            product_name=product_name,
            customer_code=customer_code,
            region=region,
            quantity=qty,
            unit_price=unit_price,
            total_amount=rev
        ))

    with transaction.atomic():
        # Auto-create missing products and customers for this business
        for prod_name in products_to_ensure:
            Product.objects.get_or_create(business=business, name=prod_name, defaults={'selling_price': 0})

        for cust_code, reg in customers_to_ensure:
            Customer.objects.get_or_create(business=business, customer_code=cust_code, defaults={'region': reg})

        Sale.objects.bulk_create(sales_objs)

    return {
        'total_records': total_records,
        'valid_records': valid_records,
        'duplicates_removed': duplicates_removed,
        'missing_handled': int(missing_handled),
        'quality_score': quality_score,
    }

def process_expenses_csv(file_obj, business):
    df = pd.read_csv(file_obj)
    df.columns = df.columns.str.strip()
    validate_csv_columns(df, 'EXPENSES')

    total_records = len(df)
    if total_records == 0:
        raise ValueError("Uploaded CSV is empty.")

    initial_len = len(df)
    df = df.drop_duplicates()
    duplicates_removed = initial_len - len(df)

    df['Category'] = df['Category'].astype(str).str.strip()
    df['Description'] = df['Description'].astype(str).str.strip()
    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')

    missing_handled = df[['Date', 'Amount']].isna().sum().sum()
    df = df.dropna(subset=['Date', 'Amount'])
    df = df[df['Amount'] >= 0]

    valid_records = len(df)
    quality_score = round((valid_records / total_records) * 100, 1) if total_records > 0 else 0.0

    expense_objs = []
    for idx, row in df.iterrows():
        expense_objs.append(Expense(
            business=business,
            date=row['Date'].date(),
            category=row['Category'],
            description=row['Description'] if row['Description'] != 'nan' else '',
            amount=float(row['Amount'])
        ))

    with transaction.atomic():
        Expense.objects.bulk_create(expense_objs)

    return {
        'total_records': total_records,
        'valid_records': valid_records,
        'duplicates_removed': duplicates_removed,
        'missing_handled': int(missing_handled),
        'quality_score': quality_score,
    }
