
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  category,
  isNew = false,
  isSale = false,
  salePrice,
}) => {
  return (
    <div className="group relative">
      {/* Product Image */}
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-100 group-hover:opacity-90 transition">
        <Link to={`/product/${id}`} className="block w-full h-full transition-transform duration-300 group-hover:scale-105">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover object-center"
          />
        </Link>
        
        {/* Status Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <span className="inline-block bg-drip-teal text-white px-2 py-1 text-xs font-semibold rounded">
              NEW
            </span>
          )}
          {isSale && (
            <span className="inline-block bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              SALE
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full h-8 w-8"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Product Info */}
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-500">{category}</h3>
          <Link to={`/product/${id}`}>
            <h2 className="text-sm font-medium text-black hover:text-amber-600 transition-colors">{name}</h2>
          </Link>
          <div className="mt-1 flex items-center">
            {isSale && salePrice ? (
              <>
                <span className="text-sm font-medium text-red-600">${salePrice.toFixed(2)}</span>
                <span className="ml-2 text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-amber-600">${price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Add Button - Appears on Hover */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="default" className="w-full bg-black hover:bg-amber-600 text-xs">
          ADD TO CART
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
