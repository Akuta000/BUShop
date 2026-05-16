/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Star, Tag, User, MapPin, Package, Clock, Filter, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { BentoGrid, BentoCard } from '../components/BentoGrid';
import { CategoryIcon } from '../components/CategoryIcon';
import { Product, OrderStatus } from '../types';

// --- SHARED COMPONENTS ---

function Badge({ children, color = 'primary' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary text-white',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-black/10 text-black/60',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {children}
    </span>
  );
}

// --- HOME VIEW ---

export function HomeView({ onSelectProduct, onTabChange }: { onSelectProduct: (p: Product) => void, onTabChange: (tab: 'home' | 'search' | 'orders' | 'seller' | 'profile', subTab?: 'BUYING' | 'SELLING') => void }) {
  const { products, currentUser, updateProfile } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSellerConfirm, setShowSellerConfirm] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const categories = ['All', 'Apparel', 'Merchandise', 'Services', 'Stationery', 'Food', 'Accessory'];

  const filteredProducts = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

  const handleBecomeSeller = async () => {
    if (currentUser?.role === 'BUYER') {
      setShowSellerConfirm(true);
    } else {
      onTabChange('seller');
    }
  };

  const confirmUpgrade = async () => {
    setIsUpgrading(true);
    await updateProfile({ role: 'SELLER' });
    setIsUpgrading(false);
    setShowSellerConfirm(false);
    onTabChange('seller');
  };

  const stats = useMemo(() => {
    return {
      activeSellers: 148,
      totalListings: products.length,
      dealsThisWeek: 32
    };
  }, [products]);

  return (
    <div className="space-y-8 pb-32">
      {/* Hero / Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-editorial-text leading-tight">Marketplace</h1>
          <p className="text-editorial-text/60 font-medium tracking-tight text-sm sm:text-base">Discover student talent and club merch at BU.</p>
        </div>
        <div className="flex space-x-2 bg-black/5 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-editorial-text/40 hover:text-editorial-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Bento Grid Featured */}
      <BentoGrid>
        <BentoCard span="large" className="bg-white border border-black/10 p-6 sm:p-10 relative flex flex-col justify-end min-h-[300px] sm:min-h-[400px] group overflow-hidden">
          <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-10">
            <Badge color="primary">Featured Store</Badge>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-serif font-black tracking-tighter text-editorial-text leading-none mb-4">
              BU CSC <br/><span className="italic">Hoodie 2024</span>
            </h2>
            <p className="text-editorial-text/60 mb-6 sm:mb-8 max-w-sm font-medium leading-relaxed text-sm sm:text-base">Official student council merchandise. High-quality cotton with detailed embroidery. Limited run.</p>
            <button className="bg-primary text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-6 sm:px-8 py-3 sm:py-4 rounded-full w-fit shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Shop Collection
            </button>
          </div>
          
          {/* Aesthetic SVG Decoration from theme */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary/5 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <div className="w-60 h-60 rounded-full border border-primary/20 flex items-center justify-center text-8xl font-serif italic text-primary/10 font-black">BU</div>
          </div>
        </BentoCard>

        <BentoCard span="small" className="p-8 flex flex-col justify-between bg-editorial-bg border border-black/5">
          <div>
            <div className="w-12 h-12 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm">
              <Star size={24} fill="currentColor" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Weekly Pulse</p>
            <h3 className="text-3xl font-serif font-black italic text-editorial-text leading-none">Most <br/>Loved</h3>
          </div>
          <p className="text-xs font-bold text-editorial-text/40 uppercase tracking-widest underline decoration-primary decoration-2 underline-offset-4">See Trends</p>
        </BentoCard>

        <BentoCard 
          span="small" 
          className="p-8 flex flex-col justify-between border-2 border-dashed border-black/10 bg-transparent cursor-pointer hover:bg-black/5 transition-colors group"
          onClick={handleBecomeSeller}
        >
          <div>
            <div className="w-12 h-12 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-editorial-text/20 mb-6 group-hover:text-primary transition-colors">
              <Plus size={24} />
            </div>
            <h3 className="text-xl font-serif font-black text-editorial-text leading-tight tracking-tight">Become a <br/>Student Seller</h3>
          </div>
          <p className="text-xs font-medium text-editorial-text/40">Open your shop in minutes.</p>
        </BentoCard>

        <BentoCard span="small" className="p-8 bg-editorial-text text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Platform Scale</p>
          <h3 className="text-5xl font-serif italic font-black mb-1">{stats.activeSellers}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-6">Verified Sellers</p>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3" />
          </div>
        </BentoCard>
      </BentoGrid>

      <AnimatePresence>
        {showSellerConfirm && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
            onClick={() => setShowSellerConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-md w-full rounded-[48px] p-12 shadow-3xl text-center"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Plus size={40} />
              </div>
              <h2 className="text-3xl font-serif font-black italic text-editorial-text mb-4">Enterprise Hub Activation</h2>
              <p className="text-editorial-text/60 font-medium mb-10 leading-relaxed">
                Upgrade your student profile to SELLER status. This allows you to list products, manage inventory, and track sales velocity across campus.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={confirmUpgrade}
                  disabled={isUpgrading}
                  className="w-full bg-editorial-text text-white font-black uppercase tracking-widest py-6 rounded-full shadow-2xl hover:bg-black transition-all disabled:opacity-50"
                >
                  {isUpgrading ? 'Updating Record...' : 'Confirm Activation'}
                </button>
                <button 
                  onClick={() => setShowSellerConfirm(false)}
                  className="w-full text-editorial-text/40 font-black uppercase tracking-widest py-4 hover:text-editorial-text transition-all"
                >
                  Return to Browse
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Product List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <h2 className="text-xs font-black text-editorial-text uppercase tracking-[0.3em]">Latest Listings</h2>
          <div className="flex items-center space-x-2 text-[10px] font-black text-editorial-text/40 uppercase tracking-widest">
            <Filter size={12} />
            <span>Sort: Relevance</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              layoutId={product.id}
              onClick={() => onSelectProduct(product)}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-4 bg-editorial-bg border border-black/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-orange-900/10 transition-all duration-300 relative flex items-center justify-center">
                {product.imageUri ? (
                  <img src={product.imageUri} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <CategoryIcon 
                    category={product.category} 
                    size={64} 
                    className="text-editorial-text/10 group-hover:text-primary/20 group-hover:scale-110 transition-all duration-700" 
                  />
                )}
                <div className="absolute top-4 left-4">
                   <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                     {product.category}
                   </div>
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-editorial-text text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Archive</span>
                  </div>
                )}
              </div>
              <div className="px-2">
                <h3 className="text-base font-serif font-black text-editorial-text leading-tight mb-1 group-hover:text-primary transition-colors">{product.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-serif italic font-black text-editorial-text">₱{product.price}</span>
                  <div className="flex items-center space-x-1 text-primary">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-black text-editorial-text/40 uppercase tracking-widest">{product.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SEARCH VIEW ---

export function SearchView({ onSelectProduct }: { onSelectProduct: (p: Product) => void }) {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query) return [];
    return products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  return (
    <div className="space-y-12 pb-32">
      <div className="relative group">
        <Search className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 text-editorial-text/20 group-hover:text-primary transition-colors" size={20} />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Trace archives..."
          className="w-full bg-white border border-black/5 rounded-full px-16 sm:px-24 py-4 sm:py-8 text-xl sm:text-3xl font-serif font-black italic tracking-tighter focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm outline-none placeholder:text-editorial-text/10"
        />
      </div>

      {!query ? (
        <div className="space-y-10">
          <h2 className="text-[10px] font-black text-editorial-text/20 uppercase tracking-[0.5em] ml-4">Trending Archives</h2>
          <div className="flex flex-wrap gap-4">
            {['Hoodie', 'Lanyard', 'Commissions', 'Tutoring', 'Academic Services', 'Notebook', 'Graphic Design'].map(t => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="px-8 py-4 bg-white border border-black/5 hover:border-primary hover:text-primary rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {results.map(product => (
            <div key={product.id} onClick={() => onSelectProduct(product)} className="group cursor-pointer">
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-4 bg-editorial-bg border border-black/5 shadow-sm group-hover:shadow-2xl transition-all duration-500 flex items-center justify-center">
                {product.imageUri ? (
                  <img src={product.imageUri} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <CategoryIcon 
                    category={product.category} 
                    size={64} 
                    className="text-editorial-text/10 group-hover:text-primary/20 group-hover:scale-110 transition-all duration-700" 
                  />
                )}
              </div>
              <h3 className="font-serif font-black text-editorial-text text-lg italic group-hover:text-primary transition-colors">{product.title}</h3>
              <p className="font-serif font-black text-2xl text-editorial-text/40">₱{product.price}</p>
            </div>
          ))}
          {results.length === 0 && (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-black/5 rounded-[60px]">
              <Package size={64} className="mx-auto text-editorial-text/5 mb-6" />
              <h3 className="text-xl font-serif italic font-black text-editorial-text/20 tracking-tighter uppercase">No archives match your query "{query}"</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- PRODUCT DETAIL MODAL ---

export function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const { placeOrder, currentUser } = useStore();
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState<'COD' | 'MEETUP' | 'GCASH' | 'PAYPAL'>('COD');
  const [notes, setNotes] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = () => {
    placeOrder(product.id, qty, notes, method);
    setIsOrdering(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isOrdering) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6 z-[60] bg-white">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
           <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
             <CheckCircle2 size={48} />
           </div>
           <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
           <p className="text-gray-500 font-medium">Your request has been sent to the seller.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm sm:flex sm:items-center sm:justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={product.id}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-[40px] overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/60 backdrop-blur rounded-full text-gray-900 z-10 shadow-sm">
          <Trash2 size={24} className="rotate-45" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Gallery placeholder with Icon/Image */}
          <div className="aspect-square bg-white border-r border-black/5 flex items-center justify-center relative overflow-hidden group">
            {product.imageUri ? (
              <img src={product.imageUri} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <CategoryIcon 
                  category={product.category} 
                  size={120} 
                  className="text-editorial-text/5 group-hover:text-primary/10 group-hover:scale-125 transition-all duration-1000 relative z-10" 
                />
                {/* Aesthetic geometric decoration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
                  <div className="w-[120%] h-[120%] border border-black/[0.02] rounded-full absolute animate-pulse" />
                  <div className="w-[100%] h-[100%] border border-black/[0.03] rounded-full absolute scale-75" />
                  <div className="w-[80%] h-[80%] border border-black/[0.04] rounded-full absolute scale-50" />
                </div>
              </>
            )}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40 drop-shadow-md uppercase tracking-[0.5em] whitespace-nowrap z-20">
               Digital Archive Reference
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-12 flex flex-col h-full bg-editorial-bg">
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge color="primary">{product.category}</Badge>
                {product.isService && <Badge color="gray">Service</Badge>}
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black text-editorial-text mb-4 leading-tight tracking-tighter italic">{product.title}</h1>
              <div className="flex items-center justify-between border-y border-black/5 py-4 sm:py-6">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-primary">
                    <Star fill="currentColor" size={16} />
                    <span className="font-black text-editorial-text text-lg sm:text-xl">{product.rating}</span>
                  </div>
                  <span className="text-editorial-text/40 font-black uppercase tracking-widest text-[8px] sm:text-[10px]">{product.reviewCount} Reviews</span>
                </div>
                <span className="text-editorial-text font-serif italic font-black text-3xl sm:text-5xl">₱{product.price}</span>
              </div>
            </div>

            <p className="text-editorial-text/70 mb-8 sm:mb-10 leading-relaxed font-medium text-base sm:text-lg">{product.description}</p>

            <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] mb-8 sm:mb-10 flex items-center space-x-4 sm:space-x-6 shadow-sm">
              <div className="p-3 sm:p-4 bg-editorial-bg rounded-xl sm:rounded-2xl">
                <User size={20} className="text-editorial-text/40" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[8px] sm:text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Seller</p>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <p className="font-black text-editorial-text text-sm sm:text-lg truncate">{product.sellerName}</p>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full flex items-center justify-center text-[6px] sm:text-[8px] text-white flex-shrink-0">✓</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                 <p className="text-[8px] sm:text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-0.5 sm:mb-1 text-right">Stock</p>
                 <p className={`font-black text-sm sm:text-lg ${product.stock > 0 ? 'text-green-600' : 'text-primary'}`}>
                   {product.stock > 0 ? `${product.stock}` : 'Archive'}
                 </p>
              </div>
            </div>

            {/* Ordering Options */}
            <div className="space-y-6 sm:space-y-8 mt-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-2 sm:mb-3">Quantity</p>
                  <div className="flex items-center bg-white border border-black/5 rounded-full p-1.5 w-fit">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg hover:bg-editorial-bg rounded-full transition-colors">-</button>
                    <span className="w-12 sm:w-16 text-center font-serif italic font-black text-xl sm:text-2xl">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg hover:bg-editorial-bg rounded-full transition-colors">+</button>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-2 sm:mb-3 text-left sm:text-right">Protocol</p>
                   <div className="flex flex-wrap bg-white border border-black/5 rounded-[24px] sm:rounded-[32px] p-1.5 gap-1.5 w-fit sm:ml-auto">
                     <button onClick={() => setMethod('COD')} className={`px-3 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase transition-all ${method === 'COD' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-editorial-text/40'}`}>COD</button>
                     <button onClick={() => setMethod('MEETUP')} className={`px-3 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase transition-all ${method === 'MEETUP' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-editorial-text/40'}`}>MEET</button>
                     <button onClick={() => setMethod('GCASH')} className={`px-3 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase transition-all ${method === 'GCASH' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-editorial-text/40'}`}>GCASH</button>
                   </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3">Logistics Directions</p>
                <textarea
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                   placeholder="Specify meetup coordinate or special handling..."
                   className="w-full bg-white border border-black/5 rounded-[24px] p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
                />
              </div>

              <button
                disabled={product.stock === 0}
                onClick={handleOrder}
                className={`w-full font-black uppercase tracking-[0.2em] text-xs py-6 rounded-full shadow-2xl transition-all transform active:scale-95 flex items-center justify-center space-x-4 ${
                  product.stock > 0 ? 'bg-editorial-text text-white hover:bg-black shadow-black/20' : 'bg-editorial-text/5 text-editorial-text/20 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={20} />
                <span>Confirm Purchase • ₱{(product.price * qty).toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
