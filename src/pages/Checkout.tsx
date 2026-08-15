
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartWithProducts, clearCart } from '@/services/productService';
import { createOrder } from '@/services/orderService';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.enum(['credit_card', 'paypal']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please login to proceed with checkout',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartWithProducts,
  });

  useEffect(() => {
    if (cartItems && cartItems.length === 0 && !cartLoading) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checkout.',
      });
      navigate('/shop');
    }
  }, [cartItems, cartLoading, navigate, toast]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      paymentMethod: 'credit_card',
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      if (!user || !cartItems) throw new Error('User or cart not available');
      const order = await createOrder(
        user.id,
        cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        {
          fullName: values.fullName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        values.paymentMethod
      );
      clearCart();
      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
      navigate(`/order/${order.id}`);
    },
    onError: (error) => {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    placeOrderMutation.mutate(values);
  };

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + (item.product.isSale && item.product.salePrice 
      ? item.product.salePrice * item.quantity 
      : item.product.price * item.quantity),
    0
  ) || 0;

  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (!isAuthenticated || cartLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return null; // Redirect happens in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP / Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2 border p-3 rounded-lg">
                              <RadioGroupItem value="credit_card" id="credit_card" />
                              <label htmlFor="credit_card" className="flex-grow cursor-pointer">
                                Credit Card 
                                <span className="block text-sm text-gray-500">Visa, Mastercard, Amex, Discover</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <label htmlFor="paypal" className="flex-grow cursor-pointer">
                                PayPal
                                <span className="block text-sm text-gray-500">Pay with your PayPal account</span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="mt-6 text-sm text-gray-500">
                    This is a demo checkout. No actual payment will be processed. 
                    For testing purposes, any valid-looking details will work.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/cart')}
                  >
                    Return to Cart
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600"
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-3 flex justify-between">
                    <div className="flex items-start">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md mr-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      ${((item.product.isSale && item.product.salePrice 
                        ? item.product.salePrice 
                        : item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="text-gray-900 font-medium">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-semibold">Total</span>
                    <span className="text-gray-900 font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
