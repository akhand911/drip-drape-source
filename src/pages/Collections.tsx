import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const collections = [
  {
    id: 'men',
    name: "Men's Collection",
    tagline: 'Bold streetwear for the modern man',
    imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1200',
    link: '/collections/men',
  },
  {
    id: 'women',
    name: "Women's Collection",
    tagline: 'Trendsetting styles that turn heads',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200',
    link: '/collections/women',
  },
  {
    id: 'unisex',
    name: 'Unisex Essentials',
    tagline: 'Genderless staples for every wardrobe',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200',
    link: '/collections/unisex',
  },
];

const Collections = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-drip-gray py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-black">Our Collections</h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Curated catalogues designed for every vibe. Pick your drop.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link to={c.link} key={c.id} className="group relative rounded-lg overflow-hidden block">
                <div className="aspect-[3/4]">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{c.name}</h2>
                    <p className="text-white/80 mt-1">{c.tagline}</p>
                    <span className="inline-block mt-3 text-amber-400 font-semibold group-hover:underline">
                      Shop the collection →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
