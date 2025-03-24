/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { CartItem, Medicine } from '@/lib/types';
import { useAuth } from './useAuth';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          medicine:medicines(*)
        `)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      setCart(data || []);
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (medicine: Medicine, quantity: number = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      // First check if the item exists in the cart
      const { data: existingItem, error: checkError } = await supabase
        .rpc('get_cart_item', {
          p_user_id: user.id,
          p_medicine_id: medicine.id
        });

      if (checkError) throw checkError;

      if (existingItem && existingItem.length > 0) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem[0].quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem[0].id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            medicine_id: medicine.id,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      toast.success('Added to cart');
      await fetchCart();
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Error adding to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      await fetchCart();
    } catch (error: any) {
      console.error('Update quantity error:', error);
      toast.error(error.message || 'Error updating quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      toast.error(error.message || 'Error removing item');
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id || '');

      if (error) throw error;
      setCart([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Clear cart error:', error);
      toast.error(error.message || 'Error clearing cart');
    }
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}