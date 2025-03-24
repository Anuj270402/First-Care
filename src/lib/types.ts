// Database types
export type Medicine = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  requires_prescription: boolean;
  manufacturer: string;
  dosage: string;
  side_effects: string[];
  active_ingredients: string[];
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type CartItem = {
  id: string;
  user_id: string;
  medicine_id: string;
  quantity: number;
  medicine: Medicine;
};

export type Prescription = {
  id: string;
  user_id: string;
  file_url: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
};