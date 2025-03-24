/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PDFDocument } from 'pdf-lib';

interface OrderDetails {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  items: {
    medicine: {
      name: string;
      manufacturer: string;
    };
    quantity: number;
    unit_price: number;
  }[];
}

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            quantity,
            unit_price,
            medicine:medicines(
              name,
              manufacturer
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error:any) {
      toast.error('Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const { error } = await supabase
        .rpc('cancel_order', {
          p_order_id: id,
          p_reason: cancellationReason
        });

      if (error) throw error;

      toast.success('Order cancelled successfully');
      setCancelDialogOpen(false);
      await fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.message || 'Error cancelling order');
    }
  };

  const generateInvoicePDF = async () => {
    if (!order) return;

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Add content to the PDF
      page.drawText('INVOICE', {
        x: 50,
        y: height - 50,
        size: 24,
      });

      page.drawText(`Invoice Number: ${order.invoice_number}`, {
        x: 50,
        y: height - 100,
        size: 12,
      });

      page.drawText(`Date: ${format(new Date(order.created_at), 'PPP')}`, {
        x: 50,
        y: height - 120,
        size: 12,
      });

      // Add shipping address
      page.drawText('Shipping Address:', {
        x: 50,
        y: height - 160,
        size: 12,
      });
      page.drawText(order.shipping_address, {
        x: 50,
        y: height - 180,
        size: 12,
      });

      // Add items table
      let yOffset = height - 240;
      page.drawText('Items:', {
        x: 50,
        y: yOffset,
        size: 12,
      });

      yOffset -= 30;
      order.items.forEach((item) => {
        page.drawText(item.medicine.name, {
          x: 50,
          y: yOffset,
          size: 10,
        });
        page.drawText(`${item.quantity} x $${item.unit_price.toFixed(2)}`, {
          x: 300,
          y: yOffset,
          size: 10,
        });
        page.drawText(`$${(item.quantity * item.unit_price).toFixed(2)}`, {
          x: 450,
          y: yOffset,
          size: 10,
        });
        yOffset -= 20;
      });

      // Add total
      page.drawText(`Total Amount: $${order.total_amount.toFixed(2)}`, {
        x: 350,
        y: yOffset - 30,
        size: 14,
      });

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.invoice_number}.pdf`;
      link.click();
    } catch (error) {
      toast.error('Error generating invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">
          Order not found
        </h1>
        <Link to="/orders" className="mt-4">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Invoice #{order.invoice_number}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={generateInvoicePDF}>
            Download Invoice
          </Button>
          {['pending', 'processing'].includes(order.status) && (
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Cancel Order</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Cancellation Reason
                    </label>
                    <Textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide a reason for cancellation"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={!cancellationReason}
                  >
                    Confirm Cancellation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Order Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{format(new Date(order.created_at), 'PPP')}</span>
              </div>
              {order.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled Date</span>
                  <span>{format(new Date(order.cancelled_at), 'PPP')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Shipping Address</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {order.shipping_address}
            </p>
          </div>

          {order.cancellation_reason && (
            <div className="p-4 border rounded-lg border-destructive">
              <h2 className="font-semibold mb-2">Cancellation Reason</h2>
              <p className="text-muted-foreground">
                {order.cancellation_reason}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Order Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.medicine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.medicine.manufacturer}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}