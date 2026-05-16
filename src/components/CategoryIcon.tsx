import React from 'react';
import { Shirt, ShoppingBag, Briefcase, Pencil, Utensils, Sparkles, Package } from 'lucide-react';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 24, className = "" }: CategoryIconProps) {
  switch (category) {
    case 'Apparel':
      return <Shirt size={size} className={className} />;
    case 'Merchandise':
      return <ShoppingBag size={size} className={className} />;
    case 'Services':
      return <Briefcase size={size} className={className} />;
    case 'Stationery':
      return <Pencil size={size} className={className} />;
    case 'Food':
      return <Utensils size={size} className={className} />;
    case 'Accessory':
      return <Sparkles size={size} className={className} />;
    default:
      return <Package size={size} className={className} />;
  }
}
