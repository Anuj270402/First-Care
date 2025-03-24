/*
  # Online Pharmacy Database Schema

  1. New Tables
    - users (extends auth.users)
      - profile information
      - medical history
      - preferences
    - medicines
      - complete medicine catalog
      - includes pricing and inventory
    - categories
      - medicine categories/types
    - prescriptions
      - uploaded prescriptions
      - verification status
    - orders
      - order details and status
    - order_items
      - individual items in orders
    - cart_items
      - shopping cart contents
    - price_alerts
      - user price notifications
    - medicine_reviews
      - user reviews and ratings
    
  2. Security
    - RLS policies for all tables
    - Secure access patterns
    - Data protection
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('pending', 'verified', 'rejected');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  medical_history TEXT,
  allergies TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT false,
  manufacturer TEXT,
  dosage TEXT,
  side_effects TEXT[],
  active_ingredients TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  file_url TEXT NOT NULL,
  status prescription_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  prescription_id UUID REFERENCES prescriptions(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  medicine_id UUID REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  medicine_id UUID REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, medicine_id)
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  medicine_id UUID REFERENCES medicines(id),
  target_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, medicine_id)
);

-- Medicine reviews table
CREATE TABLE IF NOT EXISTS medicine_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  medicine_id UUID REFERENCES medicines(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, medicine_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Medicines policies
CREATE POLICY "Anyone can view medicines" ON medicines
  FOR SELECT USING (true);

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Prescriptions policies
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Price alerts policies
CREATE POLICY "Users can manage their own price alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Medicine reviews policies
CREATE POLICY "Anyone can view reviews" ON medicine_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON medicine_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_medicine ON price_alerts(user_id, medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_reviews_medicine ON medicine_reviews(medicine_id);