
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, Truck, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductById, addToCart } from '@/services/productService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id || ''),
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({ productId: product.id, quantity });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Product Not Found</h1>
            <p className="mt-2 text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/shop">
              <Button className="mt-6 bg-amber-600 hover:bg-amber-700 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8 animate-fade-up">
          {/* Product Image */}
          <div className="md:w-1/2">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/shop" className="hover:text-amber-600">Shop</Link>
              <span>/</span>
              <Link to={`/shop?category=${product.category}`} className="hover:text-amber-600">
                {product.category}
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-black">{product.name}</h1>
              {product.isNew && (
                <Badge className="bg-green-100 text-green-800">NEW</Badge>
              )}
              {product.isSale && (
                <Badge className="bg-red-100 text-red-800">SALE</Badge>
              )}
            </div>

            <div className="mt-4">
              {product.isSale && product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-red-600">${product.salePrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-2xl font-semibold text-amber-600">${product.price.toFixed(2)}</span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-black">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-black">Features</h2>
                <ul className="mt-2 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <Check className="h-4 w-4 text-amber-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    -
                  </Button>
                  <span className="mx-4 min-w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.inventory}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    +
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {product.inventory > 0 
                    ? `${product.inventory} in stock` 
                    : 'Out of stock'}
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={product.inventory === 0 || addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button variant="outline" size="icon" className="border-amber-600 hover:bg-amber-50">
                  <Heart className="h-5 w-5 text-amber-600" />
                </Button>
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <Truck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">Free Shipping</h3>
                    <p className="text-sm text-gray-500">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">30-Day Returns</h3>
                    <p className="text-sm text-gray-500">Satisfaction guaranteed</p>
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

export default ProductDetail;
