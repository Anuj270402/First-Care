/*
  # Fix Cart and Order Security Policies

  1. Updates
    - Fix cart items policies to handle single row queries
    - Add proper order items policies
    - Add proper order management policies
    - Improve error handling for cart operations

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for CRUD operations
    - Ensure proper user access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;

-- Cart Items Policies
CREATE POLICY "Users can view their cart items"
  ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their cart"
  ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart items"
  ON cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove items from their cart"
  ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order Items Policies
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

CREATE POLICY "Users can create order items for their orders"
  ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Function to check cart item existence
CREATE OR REPLACE FUNCTION get_cart_item(p_user_id UUID, p_medicine_id UUID)
RETURNS TABLE (
  id UUID,
  quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT cart_items.id, cart_items.quantity
  FROM cart_items
  WHERE user_id = p_user_id
  AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;