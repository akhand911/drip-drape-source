
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Package, User, Home, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orderService';
import { useQuery } from '@tanstack/react-query';

const Orders = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => user ? getUserOrders(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  if (!isAuthenticated || !user) {
    return null; // Will redirect due to useEffect
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gray-100"
                  onClick={() => navigate('/account/orders')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/account/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>
                  View and track all your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {orders.map((order) => (
                      <AccordionItem key={order.id} value={order.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex justify-between w-full pr-4">
                            <div className="text-left">
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-medium">${order.total.toFixed(2)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="border-t pt-4 mt-2">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Items</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <div>
                                        <span className="font-medium">{item.quantity}x</span> {item.productName}
                                      </div>
                                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-2">Shipping Address</h4>
                                <p className="text-sm">
                                  {order.shippingAddress.fullName}<br />
                                  {order.shippingAddress.address}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                  {order.shippingAddress.country}
                                </p>
                              </div>
                              
                              <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-2">Payment</h4>
                                <div className="flex justify-between text-sm">
                                  <span>Payment Method</span>
                                  <span>{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Payment Status</span>
                                  <Badge variant="outline" className={
                                    order.paymentStatus === 'paid'
                                      ? 'border-green-500 text-green-700'
                                      : order.paymentStatus === 'refunded'
                                      ? 'border-purple-500 text-purple-700'
                                      : 'border-yellow-500 text-yellow-700'
                                  }>
                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
                    <Button
                      onClick={() => navigate('/shop')}
                      className="mt-6 bg-yellow-500 hover:bg-yellow-600"
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
