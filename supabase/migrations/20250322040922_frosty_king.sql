/*
  # Medicine Inventory and Tracking Update

  1. New Tables
    - `medicine_batches`
      - Track medicine inventory by batch
      - Expiration dates and batch numbers
      - Manufacturing dates
    - `inventory_transactions`
      - Track all inventory movements
      - Stock ins and outs
      - Batch-level tracking
    - `medicine_categories`
      - Additional categorization for medicines
      - Hierarchical category structure

  2. Modifications
    - Add inventory tracking columns to medicines table
    - Add category relationships
    - Add batch tracking

  3. Security
    - Enable RLS on new tables
    - Add policies for inventory management
*/

-- Medicine batches table
CREATE TABLE IF NOT EXISTS medicine_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES medicines(id),
  batch_number TEXT NOT NULL,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(medicine_id, batch_number)
);

-- Inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_batch_id UUID REFERENCES medicine_batches(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('purchase', 'sale', 'adjustment', 'return')),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medicine categories table (for additional categorization)
CREATE TABLE IF NOT EXISTS medicine_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES medicine_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to medicines table
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 0;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS medicine_category_id UUID REFERENCES medicine_categories(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medicine_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicine_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_batch ON inventory_transactions(medicine_batch_id);
CREATE INDEX IF NOT EXISTS idx_medicine_categories_parent ON medicine_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(medicine_category_id);

-- Enable RLS
ALTER TABLE medicine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Medicine batches policies
CREATE POLICY "Medicine batches are viewable by all authenticated users"
  ON medicine_batches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Medicine batches are insertable by authorized users"
  ON medicine_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Inventory transactions policies
CREATE POLICY "Inventory transactions are viewable by authenticated users"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inventory transactions are insertable by authorized users"
  ON inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role IN ('admin', 'staff')
    )
  );

-- Medicine categories policies
CREATE POLICY "Medicine categories are viewable by all users"
  ON medicine_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Medicine categories are manageable by authorized users"
  ON medicine_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Functions for inventory management
CREATE OR REPLACE FUNCTION update_medicine_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.transaction_type = 'in' THEN
      UPDATE medicine_batches
      SET quantity = quantity + NEW.quantity
      WHERE id = NEW.medicine_batch_id;
    ELSIF NEW.transaction_type = 'out' THEN
      UPDATE medicine_batches
      SET quantity = quantity - NEW.quantity
      WHERE id = NEW.medicine_batch_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating stock levels
CREATE TRIGGER update_stock_after_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_medicine_stock();

-- Function to check stock levels
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity < 0 THEN
    RAISE EXCEPTION 'Stock quantity cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for checking stock levels
CREATE TRIGGER check_stock_before_update
  BEFORE UPDATE ON medicine_batches
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_levels();