
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '@/services/productService';

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ title, subtitle }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        // Get first 4 products for featured section
        setProducts(allProducts.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
          </div>
          <Link to="/shop" className="text-drip-purple font-medium flex items-center hover:underline">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-md w-full h-64 mb-4"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                category={product.category}
                isNew={product.isNew}
                isSale={product.isSale}
                salePrice={product.salePrice}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
