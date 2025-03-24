/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const total = cart.reduce(
    (sum, item) =>
      sum + (item.medicine.discount_price || item.medicine.price) * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to complete your order');
      return;
    }

    try {
      setLoading(true);

      // Prepare order items
      const orderItems = cart.map((item) => ({
        medicine_id: item.medicine_id,
        quantity: item.quantity
      }));

      // Create order using the stored procedure
      const { error } = await supabase
        .rpc('create_order_with_items', {
          p_user_id: user?.id,
          p_shipping_address: form.address,
          p_items: orderItems
        });

      if (error) throw error;

      // Clear cart after successful order
      await clearCart();

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.medicine.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    $
                    {(
                      (item.medicine.discount_price || item.medicine.price) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total</p>
                <p className="text-xl font-bold">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </div>
  );
}