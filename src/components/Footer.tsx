
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-drip-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-xl font-display font-bold text-drip-purple">Drip$</span>
              <span className="text-xl font-display font-bold text-drip-teal">Drape</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Elevating Gen Z fashion with bold, authentic styles that speak to your unique identity.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop/all" className="text-gray-400 hover:text-white transition text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop/new-arrivals" className="text-gray-400 hover:text-white transition text-sm">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop/bestsellers" className="text-gray-400 hover:text-white transition text-sm">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/shop/sale" className="text-gray-400 hover:text-white transition text-sm">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-gray-400 hover:text-white transition text-sm">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-white transition text-sm">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition text-sm">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Drip$Drape. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
