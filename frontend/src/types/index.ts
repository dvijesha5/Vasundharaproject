export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface LoginRecord {
  id: number;
  user?: number;
  user_email?: string;
  user_name?: string;
  email: string;
  ip_address?: string;
  user_agent: string;
  status: 'SUCCESS' | 'FAILED';
  failure_reason?: string;
  timestamp: string;
}


export interface Business {
  id: number;
  name: string;
  industry: string;
  currency: string;
  role?: string;
  created_at: string;
}

export interface Sale {
  id: number;
  date: string;
  product_name: string;
  customer_code: string;
  region: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Dataset {
  id: number;
  dataset_type: 'SALES' | 'EXPENSES';
  file_name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  total_records: number;
  valid_records: number;
  duplicates_removed: number;
  missing_handled: number;
  quality_score: number;
  error_message?: string;
  uploaded_at: string;
}

export interface KPIMetrics {
  revenue: number;
  revenue_growth: number;
  expenses: number;
  expense_growth: number;
  profit: number;
  profit_margin: number;
  orders: number;
  customers: number;
}

export interface MonthlyTrend {
  month: string;
  revenue?: number;
  amount?: number;
  orders?: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface RegionalSales {
  region: string;
  revenue: number;
}

export interface ProductSummary {
  name: string;
  revenue: number;
  quantity: number;
  orders: number;
  avg_price: number;
  share_percentage: number;
}

export interface RootCauseAnalysis {
  has_data: boolean;
  current_period?: string;
  previous_period?: string;
  current_revenue?: number;
  previous_revenue?: number;
  revenue_change_amount?: number;
  revenue_change_percentage?: number;
  headline?: string;
  key_takeaways?: string[];
  most_significant_factor?: string;
  message?: string;
}
