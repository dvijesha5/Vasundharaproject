import pandas as pd

REQUIRED_SALES_COLUMNS = {'Date', 'Product', 'Customer', 'Region', 'Quantity', 'Revenue'}
REQUIRED_EXPENSE_COLUMNS = {'Date', 'Category', 'Description', 'Amount'}

def validate_csv_columns(df: pd.DataFrame, dataset_type: str):
    columns = set(df.columns.str.strip())
    if dataset_type == 'SALES':
        missing = REQUIRED_SALES_COLUMNS - columns
        if missing:
            raise ValueError(f"Missing required sales columns: {', '.join(missing)}")
    elif dataset_type == 'EXPENSES':
        missing = REQUIRED_EXPENSE_COLUMNS - columns
        if missing:
            raise ValueError(f"Missing required expense columns: {', '.join(missing)}")
    else:
        raise ValueError(f"Invalid dataset type: {dataset_type}")
