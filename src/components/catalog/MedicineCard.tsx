import { Medicine } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="object-cover w-full h-full"
          />
          {medicine.requires_prescription && (
            <Badge className="absolute top-2 right-2">
              Prescription Required
            </Badge>
          )}
        </div>
        <CardTitle className="mt-4">{medicine.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
          <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              ${medicine.discount_price || medicine.price}
            </span>
            {medicine.discount_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${medicine.price}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {user ? (
          <Button
            onClick={() => addToCart(medicine)}
            disabled={medicine.requires_prescription}
          >
            Add to Cart
          </Button>
        ) : (
          <AuthModal />
        )}
        <Link to={`/product/${medicine.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}