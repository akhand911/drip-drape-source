import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'men',
    name: "Men",
    imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000',
    link: '/collections/men',
  },
  {
    id: 'women',
    name: 'Women',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
    link: '/collections/women',
  },
  {
    id: 'unisex',
    name: 'Unisex',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
    link: '/collections/unisex',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1499202977705-65f436dac18a?q=80&w=1000',
    link: '/shop',
  },
];

const Categories = () => {
  return (
    <section className="py-16 bg-drip-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop By Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find your perfect style in our carefully curated catalogues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link to={category.link} key={category.id} className="group">
              <div className="relative rounded-lg overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    <p className="text-amber-400 mt-1 group-hover:underline font-medium">Shop Now</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
