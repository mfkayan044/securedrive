// Coupon type for admin panel
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  expires_at: string | null;
  is_active: boolean;
  assigned_user: string | null;
  created_at: string;
}
