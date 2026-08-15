import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProductsByGender, Product, Gender } from '@/services/productService';

const meta: Record<Gender, { title: string; subtitle: string; banner: string }> = {
  men: {
    title: "Men's Collection",
    subtitle: 'Streetwear staples, statement outerwear, and everyday essentials.',
    banner: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600',
  },
  women: {
    title: "Women's Collection",
    subtitle: 'Bold silhouettes, fresh drops, and pieces that make a statement.',
    banner: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600',
  },
  unisex: {
    title: 'Unisex Essentials',
    subtitle: 'Genderless staples designed for everyone.',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600',
  },
};

const CollectionDetail = () => {
  const { gender } = useParams<{ gender: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isValid = gender === 'men' || gender === 'women' || gender === 'unisex';

  useEffect(() => {
    if (!isValid) return;
    setLoading(true);
    getProductsByGender(gender as Gender)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [gender, isValid]);

  if (!isValid) return <Navigate to="/collections" replace />;

  const info = meta[gender as Gender];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={info.banner} alt={info.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-4">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-bold text-white">{info.title}</h1>
              <p className="mt-3 text-white/80 max-w-xl mx-auto">{info.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-md w-full h-64 mb-4"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No products in this collection yet.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">Showing {products.length} products</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    imageUrl={p.imageUrl}
                    category={p.category}
                    isNew={p.isNew}
                    isSale={p.isSale}
                    salePrice={p.salePrice}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CollectionDetail;
