/*
  # Fix Order Creation Function

  1. Changes
    - Fix SQL syntax error in create_order_with_items function
    - Improve error handling
    - Add input validation
*/

-- Drop existing function
DROP FUNCTION IF EXISTS create_order_with_items(UUID, TEXT, JSONB);

-- Recreate function with fixed syntax
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_shipping_address TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_total_amount DECIMAL(10,2);
BEGIN
  -- Validate input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Calculate total amount
  SELECT COALESCE(SUM(
    (item->>'quantity')::integer * 
    (SELECT LEAST(m.price, COALESCE(m.discount_price, m.price))
     FROM medicines m
     WHERE m.id = (item->>'medicine_id')::uuid)
  ), 0) INTO v_total_amount
  FROM jsonb_array_elements(p_items) item;

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
    v_total_amount,
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
    (SELECT LEAST(m.price, COALESCE(m.discount_price, m.price))
     FROM medicines m
     WHERE m.id = (item->>'medicine_id')::uuid),
    now()
  FROM jsonb_array_elements(p_items) item;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;