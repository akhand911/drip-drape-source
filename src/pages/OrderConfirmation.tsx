import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderById } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, loading, navigate]);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id || ''),
    enabled: !!id,
  });

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          </div>
        ) : !order ? (
          <div className="text-center py-24">
            <h1 className="text-2xl font-bold text-black">Order not found</h1>
            <Link to="/shop"><Button className="mt-6 bg-amber-600 hover:bg-amber-700">Continue shopping</Button></Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <CheckCircle2 className="mx-auto h-16 w-16 text-amber-500" />
              <h1 className="mt-4 text-3xl font-bold text-black">Order Confirmed!</h1>
              <p className="mt-2 text-gray-600">Thanks for shopping with Drip$Drape. Your drip is on its way.</p>
              <p className="mt-1 text-sm text-gray-500">Order ID: <span className="font-mono">{order.id}</span></p>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-amber-600">Order Details</CardTitle>
                <Badge className="bg-amber-100 text-amber-800">{order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="divide-y">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-3 flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-500" />
                        <span>{it.productName} × {it.quantity}</span>
                      </div>
                      <span className="font-medium">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 text-sm text-gray-600">
                  <p className="font-semibold text-black mb-1">Shipping to</p>
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex gap-3 justify-center">
              <Button onClick={() => navigate('/shop')} className="bg-amber-600 hover:bg-amber-700">Continue Shopping</Button>
              <Button variant="outline" onClick={() => navigate('/account/orders')}>View All Orders</Button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
