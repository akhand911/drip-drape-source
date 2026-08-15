
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartWithProducts, updateCartItemQuantity, clearCart } from '@/services/productService';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartWithProducts,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      updateCartItemQuantity(productId, quantity);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => {
      clearCart();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantityMutation.mutate({ productId, quantity });
  };

  const handleRemoveItem = (productId: string) => {
    updateQuantityMutation.mutate({ productId, quantity: 0 });
  };

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + (item.product.isSale && item.product.salePrice 
      ? item.product.salePrice * item.quantity 
      : item.product.price * item.quantity),
    0
  ) || 0;

  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
            <Button
              onClick={() => navigate('/shop')}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-500">{item.product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.product.isSale && item.product.salePrice ? (
                            <div>
                              <div className="text-sm font-medium text-red-600">${item.product.salePrice.toFixed(2)}</div>
                              <div className="text-sm text-gray-500 line-through">${item.product.price.toFixed(2)}</div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">${item.product.price.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, Math.max(1, item.quantity - 1))}
                              disabled={updateQuantityMutation.isPending}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.product.inventory}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, Math.min(item.product.inventory, item.quantity + 1))}
                              disabled={updateQuantityMutation.isPending || item.quantity >= item.product.inventory}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${((item.product.isSale && item.product.salePrice 
                              ? item.product.salePrice 
                              : item.product.price) * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id)}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => clearCartMutation.mutate()}
                  disabled={clearCartMutation.isPending}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
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
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
                {subtotal < 50 && shipping > 0 && (
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    Add ${(50 - subtotal).toFixed(2)} more to get free shipping
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
