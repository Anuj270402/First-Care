/*
  # Fix Cart Item Function

  1. Changes
    - Drop existing get_cart_item function
    - Recreate get_cart_item function with proper security and error handling
    - Add explicit function exposure for RPC
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_cart_item(UUID, UUID);

-- Recreate the function with proper security and error handling
CREATE OR REPLACE FUNCTION get_cart_item(
  p_user_id UUID,
  p_medicine_id UUID
) RETURNS TABLE (
  id UUID,
  quantity INTEGER
) AS $$
BEGIN
  -- Verify the user is accessing their own cart
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT cart_items.id, cart_items.quantity
  FROM cart_items
  WHERE user_id = p_user_id
  AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_cart_item(UUID, UUID) TO authenticated;