import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { Medicine } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ProductDetails() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMedicine(data);
    } catch (error) {
      toast.error('Error fetching medicine details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">
          Medicine not found
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="object-cover w-full h-full"
          />
          {medicine.requires_prescription && (
            <Badge className="absolute top-4 right-4">
              Prescription Required
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{medicine.name}</h1>
            <p className="text-lg text-muted-foreground">
              {medicine.manufacturer}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${medicine.discount_price || medicine.price}
              </span>
              {medicine.discount_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${medicine.price}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Stock: {medicine.stock_quantity} units
            </p>
          </div>

          <p className="text-muted-foreground">{medicine.description}</p>

          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={() => addToCart(medicine)}
            disabled={medicine.requires_prescription}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="dosage">Dosage</TabsTrigger>
          <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <h2 className="text-xl font-semibold">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Active Ingredients</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {medicine.active_ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Manufacturer Information</h3>
              <p className="text-muted-foreground">{medicine.manufacturer}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="dosage" className="space-y-4">
          <h2 className="text-xl font-semibold">Dosage Information</h2>
          <p className="text-muted-foreground">{medicine.dosage}</p>
        </TabsContent>
        <TabsContent value="side-effects" className="space-y-4">
          <h2 className="text-xl font-semibold">Side Effects</h2>
          <ul className="list-disc list-inside text-muted-foreground">
            {medicine.side_effects.map((effect, index) => (
              <li key={index}>{effect}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}