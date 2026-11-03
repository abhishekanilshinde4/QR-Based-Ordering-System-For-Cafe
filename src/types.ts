export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  available: boolean;
  is_veg?: boolean;
  name_hi?: string;
  description_hi?: string;
  name_mr?: string;
  description_mr?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  cart_id: string;
  menu_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  notes: string;
  is_veg?: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id?: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  notes?: string | null;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface CustomerInfo {
  name: string;
  phone: string;
  table_number: number;
}

export interface Order {
  id: string;
  order_number: number;
  table_number: number;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number;
  status: OrderStatus;
  notes?: string | null;
  completed: boolean;
  is_finalized?: boolean;
  is_fast_order?: boolean;
  is_modified?: boolean;
  created_at: string;
  items: OrderItem[];
  review?: Review | null;
}

export interface Table {
  id: string;
  table_number: number;
  qr_code: string;
}

export interface AdminUser {
  id: string;
  username: string;
}

export interface Review {
  id: string;
  order_id?: string | null;
  table_number: number;
  customer_name?: string | null;
  rating: number; // 1 to 5
  review_text?: string | null;
  created_at: string;
}

export interface WaiterCall {
  id: string;
  table_number: number;
  customer_name?: string | null;
  reason: string; // 'Water' | 'Bill' | 'Cutlery' | 'General Assistance'
  status: 'pending' | 'attended';
  created_at: string;
}

export type Language = 'en' | 'hi' | 'mr';
