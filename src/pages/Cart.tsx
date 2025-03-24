import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
      </div>
    );
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + (item.medicine.discount_price || item.medicine.price) * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cart.length > 0 && (
          <Button variant="destructive" onClick={clearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/catalog">
            <Button>Browse Medicines</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={item.medicine.image_url}
                  alt={item.medicine.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.medicine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.medicine.manufacturer}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.medicine.dosage}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-20"
                  />
                  <div className="text-right">
                    <p className="font-semibold">
                      $
                      {(
                        (item.medicine.discount_price || item.medicine.price) *
                        item.quantity
                      ).toFixed(2)}
                    </p>
                    {item.medicine.discount_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${(item.medicine.price * item.quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="text-lg font-semibold">Total</p>
              <p className="text-sm text-muted-foreground">
                {cart.length} items
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/checkout">
              <Button size="lg">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}