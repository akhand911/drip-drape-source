
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, ShoppingBag, Home, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orderService';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user orders
  const { data: orders } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => user ? getUserOrders(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  if (!isAuthenticated || !user) {
    return null; // Will redirect due to useEffect
  }

  const recentOrders = orders?.slice(0, 3) || [];

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
                  className="w-full justify-start"
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
          <div className="w-full md:w-3/4 space-y-8">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {user.name}!</CardTitle>
                <CardDescription>
                  Here's an overview of your account activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-full mr-3">
                        <Package className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-lg font-semibold">{orders?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-full mr-3">
                        <ShoppingBag className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Orders</p>
                        <p className="text-lg font-semibold">
                          {orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="text-yellow-500 border-yellow-500 hover:bg-yellow-50 w-full"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Track your recent purchases and their delivery status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">Order #{order.id}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-medium mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Button
                      variant="link"
                      className="mt-2 text-yellow-500"
                      onClick={() => navigate('/shop')}
                    >
                      Start shopping
                    </Button>
                  </div>
                )}
              </CardContent>
              {recentOrders.length > 0 && (
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/account/orders')}
                  >
                    View All Orders
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
