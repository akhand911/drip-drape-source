
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-white">
      {/* Hero Container */}
      <div className="relative h-[90vh] max-h-[800px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070"
            alt="Fashion model in stylish outfit"
            className="h-full w-full object-cover opacity-70"
          />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-up bg-white/80 p-8 rounded-lg backdrop-blur-sm">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                STYLE THAT
              </span>
              <br />
              DEFINES YOU
            </h1>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
              Discover the latest trends that speak to your unique identity. Bold designs for the next generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop/new-arrivals" className="btn-primary">
                Shop New Arrivals
              </Link>
              <Link to="/collections" className="btn-outline border-yellow-400 text-yellow-500 hover:bg-yellow-400 hover:text-white">
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
