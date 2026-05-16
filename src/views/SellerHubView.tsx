import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Package, Plus, ChevronRight, AlertCircle, Clock, LayoutDashboard, Search, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store';
import { CategoryIcon } from '../components/CategoryIcon';
import { ImageUpload } from '../components/ImageUpload';
import { OrderStatus } from '../types';

export function SellerHubView() {
  const { products, currentUser, orders, updateOrderStatus, addProduct, deleteProduct, updateProduct } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sellerProducts = products.filter(p => p.sellerId === currentUser?.id);
  const sellingOrders = orders.filter(o => o.sellerId === currentUser?.id);

  const earnings = sellingOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const filteredProducts = sellerProducts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-serif font-black italic tracking-tighter text-editorial-text mb-4">
            Seller Hub
          </h1>
          <p className="text-editorial-text/60 font-medium italic text-lg decoration-primary/20 underline underline-offset-8">
            Central command for your campus enterprise.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-[24px] text-[10px] hover:bg-black transition-all flex items-center space-x-4 shadow-2xl shadow-primary/20 group"
        >
          <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
          <span>Launch New Listing</span>
        </button>
      </header>

      {/* Metric Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-editorial-text text-white p-10 rounded-[48px] shadow-2xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Net Revenue</p>
          <h3 className="text-5xl font-serif italic font-black mb-8">₱{earnings.toLocaleString()}</h3>
          <div className="flex items-center space-x-3 text-white/60 text-[10px] font-black uppercase tracking-widest border-t border-white/10 pt-6">
            <LayoutDashboard size={14} />
            <span>Archive Integrity Verified</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-black/5 shadow-sm group hover:border-primary/20 transition-colors">
          <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.3em] mb-4">Active Orders</p>
          <h3 className="text-5xl font-serif italic font-black text-editorial-text mb-8">
            {sellingOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}
          </h3>
          <div className="flex items-center space-x-3 text-primary text-[10px] font-black uppercase tracking-widest">
            {sellingOrders.some(o => o.status === 'PENDING') ? (
              <>
                <Clock size={14} className="animate-pulse" />
                <span>Awaiting Authorization</span>
              </>
            ) : sellingOrders.some(o => o.status === 'CONFIRMED' || o.status === 'READY') ? (
              <>
                <Package size={14} className="text-indigo-400" />
                <span>Action Required: Fulfillment</span>
              </>
            ) : sellingOrders.some(o => o.status === 'COMPLETED') ? (
              <>
                <ShoppingBag size={14} className="text-green-500" />
                <span>All Orders Synchronized</span>
              </>
            ) : (
              <>
                <Package size={14} />
                <span>Waiting for Transactions</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-black/5 shadow-sm">
          <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.3em] mb-4">Inventory Reach</p>
          <h3 className="text-5xl font-serif italic font-black text-editorial-text mb-8">
            {sellerProducts.length}
          </h3>
          <p className="text-xs text-editorial-text/40 font-medium italic">Unique IDs in Marketplace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        {/* Product Management */}
        <div className="xl:col-span-2 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[10px] font-black text-editorial-text/20 uppercase tracking-[0.5em]">Inventory Logs</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-editorial-text/20" size={16} />
              <input 
                type="text" 
                placeholder="FILTER INDEX..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black/5 border-none rounded-full pl-12 pr-6 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-black/5 rounded-[48px] bg-black/[0.01]">
                <Package size={48} className="mx-auto text-editorial-text/10 mb-6" />
                <p className="text-[10px] font-black uppercase tracking-widest text-editorial-text/20">No matching records found in archive</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-20 h-20 bg-editorial-bg rounded-[32px] flex items-center justify-center border border-black/5 group-hover:scale-110 transition-transform duration-700 overflow-hidden">
                      {product.imageUri ? (
                        <img src={product.imageUri} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryIcon category={product.category} size={28} className="text-editorial-text/20 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                       <button onClick={() => deleteProduct(product.id)} className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-serif font-black text-2xl italic text-editorial-text mb-1">{product.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-editorial-text/30">{product.category}</p>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-black/5">
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-editorial-text/20 mb-1">Current Stock</p>
                        <div className="flex items-center space-x-3">
                          <p className={`text-xl font-serif font-black italic ${product.stock < 5 ? 'text-primary' : 'text-editorial-text'}`}>
                            {product.stock} Units
                          </p>
                          <button 
                            onClick={() => updateProduct(product.id, { stock: product.stock + 10 })}
                            className="bg-black text-white p-2 rounded-xl hover:bg-primary transition-all active:scale-95 flex items-center space-x-2"
                            title="Restock +10"
                          >
                            <Plus size={16} />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Restock</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.stock < 5 && (
                    <div className="absolute top-0 right-0 p-4">
                       <div className="bg-primary/10 text-primary p-2 rounded-lg animate-pulse">
                         <AlertCircle size={16} />
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales Feed */}
        <div className="space-y-10">
          <h2 className="text-[10px] font-black text-editorial-text/20 uppercase tracking-[0.5em] px-4">Sales Velocity</h2>
          <div className="space-y-4">
            {sellingOrders.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-black/5 rounded-[48px] bg-black/[0.01]">
                <p className="text-[10px] font-black uppercase tracking-widest text-editorial-text/20">Awaiting first transaction</p>
              </div>
            ) : (
              sellingOrders.slice(0, 8).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-editorial-bg rounded-2xl flex items-center justify-center text-editorial-text/20 border border-black/5">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-lg italic text-editorial-text truncate w-32">{order.productTitle}</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-editorial-text/30 mt-0.5 whitespace-nowrap">
                        ₱{order.totalPrice} • {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={order.status} />
                    {order.status === 'PENDING' ? (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-primary/20"
                      >
                        Confirm
                      </button>
                    ) : order.status === 'CONFIRMED' ? (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-primary/20"
                      >
                        Ready
                      </button>
                    ) : (
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="READY">READY</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <div className="w-8 h-8 rounded-full bg-editorial-bg flex items-center justify-center text-editorial-text/40 hover:bg-primary hover:text-white transition-colors">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddProductModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-200',
    READY: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    COMPLETED: 'bg-green-100 text-green-900 border-green-200',
    CANCELLED: 'bg-red-100 text-red-900 border-red-200',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${styles[status]}`}>{status}</span>;
}

function AddProductModal({ onClose }: { onClose: () => void }) {
  const { addProduct, uploadImage } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'Merchandise',
    isService: false,
    imageUri: ''
  });

  const handleImageSelected = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const { url, error: uploadError } = await uploadImage(file);
      if (uploadError) {
        setError(typeof uploadError === 'string' ? uploadError : uploadError.message);
      } else if (url) {
        setFormData(prev => ({ ...prev, imageUri: url }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isUploading) return;
    
    addProduct({
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      isService: formData.isService,
      imageUri: formData.imageUri
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
       <motion.div 
         initial={{ scale: 0.9, opacity: 0, y: 40 }} 
         animate={{ scale: 1, opacity: 1, y: 0 }} 
         onClick={(e) => e.stopPropagation()}
         className="bg-editorial-bg w-full max-w-xl rounded-[40px] sm:rounded-[60px] p-8 sm:p-12 shadow-3xl border border-white/20 relative my-8"
       >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/5 rounded-full" />
          
          <div className="mb-8 text-center pt-4">
            <h2 className="text-3xl sm:text-4xl font-serif font-black italic text-editorial-text tracking-tighter mb-2 leading-none">Initialize Listing</h2>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-editorial-text/30">Submit record to campus index</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {error && (
              <div className="bg-primary/5 border border-primary/20 text-primary p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in duration-300">
                <AlertTriangle size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <ImageUpload 
                onImageSelected={handleImageSelected}
                currentImage={formData.imageUri}
                onRemove={() => setFormData(prev => ({ ...prev, imageUri: '' }))}
                isUploading={isUploading}
              />
              <div className="group">
                <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Asset Nomenclature</label>
                <input 
                  placeholder="E.G. PREMIUM HOODIE V2" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} 
                  className="w-full bg-white border border-black/5 rounded-[32px] px-8 py-5 text-sm font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-editorial-text/10 uppercase tracking-widest"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Archive Description</label>
                <textarea 
                  placeholder="SPECIFY ATTRIBUTES, CONDITION, AND TERMS..." 
                  required 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-white border border-black/5 rounded-[32px] px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-editorial-text/10 h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Credit Value (₱)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    className="w-full bg-white border border-black/5 rounded-[32px] px-8 py-5 text-lg font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Archive Volume</label>
                  <input 
                    type="number" 
                    placeholder="UNITS" 
                    required 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                    className="w-full bg-white border border-black/5 rounded-[32px] px-8 py-5 text-lg font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Classification Tag</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-white border border-black/5 rounded-[32px] px-8 py-5 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                  >
                    {['Apparel', 'Merchandise', 'Services', 'Stationery', 'Food', 'Accessory'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center space-x-4 p-4 mt-6 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={formData.isService} 
                      onChange={e => setFormData({...formData, isService: e.target.checked})} 
                      className="sr-only"
                    />
                    <div className={`w-14 h-8 rounded-full transition-colors duration-300 ${formData.isService ? 'bg-primary' : 'bg-black/10'}`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.isService ? 'translate-x-6' : ''}`} />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-editorial-text/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Professional Service</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-6 pt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-black/5 text-editorial-text/40 font-black uppercase tracking-widest py-6 rounded-[32px] hover:bg-black/10 transition-all text-[10px]"
              >
                Abort
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-editorial-text text-white font-black uppercase tracking-widest py-6 rounded-[32px] shadow-2xl shadow-black/20 hover:bg-black transition-all text-[10px]"
              >
                Commit Record
              </button>
            </div>
          </form>
       </motion.div>
    </div>
  );
}
