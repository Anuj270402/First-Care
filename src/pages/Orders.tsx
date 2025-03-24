/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Order {
  id: string;
  invoice_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  cancelled_at: string | null;
  items: {
    medicine: {
      name: string;
      manufacturer: string;
    };
    quantity: number;
    unit_price: number;
  }[];
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (order.invoice_number?.toLowerCase() || '').includes(searchLower) ||
      order.items?.some((item) =>
        (item.medicine?.name?.toLowerCase() || '').includes(searchLower)
      ) || false
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusColor = (status: Order['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders found</p>
          <Link to="/catalog">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {currentOrders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Invoice #{order.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                      <p className="font-bold">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>

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
                    {order.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.medicine?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.medicine?.manufacturer}
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of{' '}
                {filteredOrders.length} orders
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}