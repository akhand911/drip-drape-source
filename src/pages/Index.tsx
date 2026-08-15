
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        
        {/* Featured Products Section */}
        <FeaturedProducts 
          title="New Arrivals" 
          subtitle="The latest additions to our collection" 
        />
        
        {/* Categories Section */}
        <Categories />
        
        {/* Trending Products Section */}
        <FeaturedProducts 
          title="Trending Now" 
          subtitle="Popular picks that everyone's loving" 
        />
        
        {/* Newsletter Section */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
