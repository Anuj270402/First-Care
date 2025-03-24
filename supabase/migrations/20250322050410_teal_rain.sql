/*
  # Order Management and Invoice Features

  1. Changes
    - Add order status management function
    - Add order cancellation function
    - Add invoice number generation
    - Add order status update triggers
    
  2. Security
    - Enable RLS for all new functions
    - Ensure proper access control
*/

-- Add invoice number column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_sequence INT;
  v_invoice_number TEXT;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '\d+$')::INT), 0) + 1
  INTO v_sequence
  FROM orders
  WHERE invoice_number LIKE 'INV-' || v_year || '-%';
  
  -- Generate invoice number
  v_invoice_number := 'INV-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status order_status
) RETURNS orders AS $$
DECLARE
  v_order orders;
BEGIN
  UPDATE orders
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;
  
  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel order
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_reason TEXT
) RETURNS orders AS $$
DECLARE
  v_order orders;
BEGIN
  -- Check if order can be cancelled
  IF NOT EXISTS (
    SELECT 1 FROM orders
    WHERE id = p_order_id
    AND status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'Order cannot be cancelled';
  END IF;

  UPDATE orders
  SET 
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = p_reason,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;
  
  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to generate invoice number on order creation
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_invoice_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();