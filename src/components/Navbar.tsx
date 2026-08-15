
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Search, Menu, X, User, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCartWithProducts } from '@/services/productService';
import { useQuery } from '@tanstack/react-query';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartWithProducts,
  });

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-display font-bold text-yellow-500">Drip$</span>
              <span className="text-xl font-display font-bold text-black">Drape</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-yellow-500 transition">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-yellow-500 transition">Shop</Link>
            <Link to="/collections" className="text-gray-700 hover:text-yellow-500 transition">Collections</Link>
            <Link to="/about" className="text-gray-700 hover:text-yellow-500 transition">About</Link>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Account" 
                onClick={() => navigate('/dashboard')}
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Login" 
                onClick={() => navigate('/login')}
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Cart"
              onClick={() => navigate('/cart')}
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Cart"
              onClick={() => navigate('/cart')}
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu} 
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100 bg-white">
            <Link to="/" className="block py-2 px-3 text-gray-700 hover:text-yellow-500">
              Home
            </Link>
            <Link to="/shop" className="block py-2 px-3 text-gray-700 hover:text-yellow-500">
              Shop
            </Link>
            <Link to="/collections" className="block py-2 px-3 text-gray-700 hover:text-yellow-500">
              Collections
            </Link>
            <Link to="/about" className="block py-2 px-3 text-gray-700 hover:text-yellow-500">
              About
            </Link>
            <div className="flex items-center space-x-3 pt-2 pl-3">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-start space-x-2 w-full px-3 py-2"
                >
                  <User className="h-5 w-5" />
                  <span>My Account</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-start space-x-2 w-full px-3 py-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
