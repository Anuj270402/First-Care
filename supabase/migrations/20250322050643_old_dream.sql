/*
  # Fix Order Cancellation Function

  1. Changes
    - Drop existing cancel_order function
    - Recreate cancel_order function with proper security and error handling
    - Add explicit function exposure for RPC
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cancel_order(UUID, TEXT);

-- Recreate the function with proper security and error handling
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_reason TEXT
) RETURNS orders AS $$
DECLARE
  v_order orders;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the order exists and belongs to the current user
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  AND user_id = v_user_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  -- Check if order can be cancelled
  IF v_order.status NOT IN ('pending', 'processing') THEN
    RAISE EXCEPTION 'Order cannot be cancelled. Current status: %', v_order.status;
  END IF;

  -- Update the order
  UPDATE orders
  SET 
    status = 'cancelled'::order_status,
    cancelled_at = now(),
    cancellation_reason = p_reason,
    updated_at = now()
  WHERE id = p_order_id
  AND user_id = v_user_id
  RETURNING * INTO v_order;

  RETURN v_order;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error cancelling order: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cancel_order(UUID, TEXT) TO authenticated;