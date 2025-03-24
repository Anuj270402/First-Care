/*
  # Fix Order Items Policies

  1. Changes
    - Drop existing policies
    - Create comprehensive policies for order items
    - Add proper security checks for order creation flow
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;

-- Create comprehensive policies for order items
CREATE POLICY "Users can view their order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
      AND orders.status = 'pending'
    )
  );

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Function to safely create an order with items
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_shipping_address TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Create the order
  INSERT INTO orders (
    user_id,
    status,
    total_amount,
    shipping_address,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    'pending',
    (
      SELECT SUM(
        (item->>'quantity')::integer * 
        COALESCE(
          (SELECT LEAST(m.price, COALESCE(m.discount_price, m.price)))
          FROM medicines m
          WHERE m.id = (item->>'medicine_id')::uuid
        )
      )
      FROM jsonb_array_elements(p_items) item
    ),
    p_shipping_address,
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- Create order items
  INSERT INTO order_items (
    order_id,
    medicine_id,
    quantity,
    unit_price,
    created_at
  )
  SELECT
    v_order_id,
    (item->>'medicine_id')::uuid,
    (item->>'quantity')::integer,
    (
      SELECT LEAST(price, COALESCE(discount_price, price))
      FROM medicines
      WHERE id = (item->>'medicine_id')::uuid
    ),
    now()
  FROM jsonb_array_elements(p_items) item;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;