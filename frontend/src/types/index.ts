export type Customer = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  notes?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
};

export type Item = {
  id: number;
  owner_customer_id: number;
  title: string;
  description?: string;
  category?: string;
  size?: string;
  brand?: string;
  color?: string;
  price: number;
  image_url?: string;
  status: string;
  is_in_store: number;
  is_online_visible: number;
  sold_at?: string | null;
  first_name: string;
  last_name: string;
  customer_number?: string;
};

export type CustomerFormData = {
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  email: string;
};

export type ItemFormData = {
  owner_customer_id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  brand: string;
  color: string;
  price: string;
  is_online_visible: boolean;
};

export type Sale = {
  id: number;
  item_id: number;
  owner_customer_id: number;
  sale_date: string;
  sale_price: number;
  owner_amount: number;
  shop_amount: number;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes?: string;
  title: string;
  brand?: string;
  category?: string;
  customer_number?: string;
  first_name: string;
  last_name: string;
};

export type SaleFormData = {
  item_id: string;
  sale_price: string;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes: string;
};

export type CustomerCredit = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  sold_items_count: number;
  credit_balance: number;
};