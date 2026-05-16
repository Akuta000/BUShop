/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, LayoutDashboard, Plus, Trash2, Edit2, AlertCircle, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { CategoryIcon } from '../components/CategoryIcon';
import { OrderStatus, Product } from '../types';

// --- BUYER ORDERS ---

export function OrdersView({ initialTab }: { initialTab?: 'BUYING' | 'SELLING' }) {
  const { orders, currentUser, updateOrderStatus } = useStore();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  
  const buyingOrders = orders.filter(o => o.buyerId === currentUser?.id);
  const sellingOrders = orders.filter(o => o.sellerId === currentUser?.id);

  const isSeller = currentUser?.role === 'SELLER' || currentUser?.role === 'ORGANIZATION';
  const [activeTab, setActiveTab] = useState<'BUYING' | 'SELLING'>(() => {
    if (initialTab) return initialTab;
    return 'BUYING';
  });

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black italic tracking-tighter text-editorial-text mb-1 sm:mb-2 leading-tight">
            {activeTab === 'BUYING' ? 'Journal of Purchases' : 'Store Records'}
          </h1>
          <p className="text-editorial-text/60 font-medium italic text-sm sm:text-base">Archive of campus trade interactions.</p>
        </div>

        {isSeller && (
          <div className="bg-black/5 p-1 rounded-full flex">
            <button
              onClick={() => setActiveTab('BUYING')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'BUYING' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-editorial-text/40'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => setActiveTab('SELLING')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'SELLING' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-editorial-text/40'
              }`}
            >
              Seller View
            </button>
          </div>
        )}
      </header>

      {activeTab === 'BUYING' ? (
        <div className="space-y-4">
          {buyingOrders.length === 0 ? (
             <div className="bg-white rounded-[32px] sm:rounded-[40px] p-12 sm:p-20 text-center border border-black/5">
               <ShoppingBag size={48} className="mx-auto text-editorial-text/5 mb-6 sm:hidden" />
               <ShoppingBag size={64} className="mx-auto text-editorial-text/5 mb-6 hidden sm:block" />
               <h3 className="text-xl sm:text-2xl font-black text-editorial-text mb-2 italic">Records Empty</h3>
               <p className="text-editorial-text/40 text-sm sm:text-base">Items you purchase will appear here.</p>
             </div>
          ) : (
            buyingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-black/5 shadow-sm flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-center group hover:shadow-xl transition-all relative overflow-hidden">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-editorial-bg rounded-[24px] sm:rounded-[32px] flex items-center justify-center border border-black/5 flex-shrink-0">
                   <Package className="text-primary/20" size={32} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusBadge status={order.status} />
                    <span className="text-[8px] sm:text-[10px] text-editorial-text/30 font-black uppercase tracking-widest leading-none">Record #{order.id.slice(-5)}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-editorial-text group-hover:text-primary transition-colors italic leading-tight">{order.productTitle}</h3>
                  <div className="flex flex-wrap items-end gap-x-4 sm:gap-x-6 gap-y-2 mt-4">
                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-editorial-text/50 font-black uppercase tracking-widest bg-black/5 px-2.5 py-1.5 rounded-lg">
                      <Package size={12}/> 
                      <span>QTY: {order.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-editorial-text/50 font-black uppercase tracking-widest bg-black/5 px-2.5 py-1.5 rounded-lg">
                      <MapPin size={12}/> 
                      <span>{order.paymentMethod}</span>
                    </div>
                    {order.phone && (
                      <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                        <span>TEL: {order.phone}</span>
                      </div>
                    )}
                    <span className="text-editorial-text font-serif italic text-xl sm:text-2xl font-black ml-auto sm:ml-0">₱{order.totalPrice}</span>
                  </div>
                </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-center">
                    {cancellingOrderId === order.id ? (
                      <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-3xl border border-red-100 animate-in fade-in zoom-in duration-300">
                        <button 
                          onClick={() => {
                            updateOrderStatus(order.id, 'CANCELLED');
                            setCancellingOrderId(null);
                          }}
                          className="bg-red-500 text-white font-black uppercase tracking-widest px-6 py-3 rounded-full text-[9px] hover:bg-black transition-all"
                        >
                          Confirm Stop
                        </button>
                        <button 
                          onClick={() => setCancellingOrderId(null)}
                          className="text-editorial-text/40 font-black uppercase tracking-widest px-4 py-3 rounded-full text-[9px] hover:text-editorial-text transition-all"
                        >
                          Back
                        </button>
                      </div>
                    ) : (
                      <>
                        {(order.status === 'READY' || order.status === 'CONFIRMED') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'COMPLETED');
                            }}
                            className="bg-primary text-white font-black uppercase tracking-widest px-6 py-4 rounded-full text-[10px] hover:bg-black transition-all flex items-center space-x-2 shadow-xl shrink-0"
                          >
                            <CheckCircle2 size={16} />
                            <span>Mark Received</span>
                          </button>
                        )}
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancellingOrderId(order.id);
                            }}
                            className="p-4 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all border border-red-100"
                            title="Cancel Order"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button className="bg-editorial-text text-white font-black uppercase tracking-widest px-8 py-4 rounded-full text-[10px] hover:bg-black transition-all flex items-center space-x-3 shadow-xl">
                           <span className="hidden sm:inline">Review Log</span>
                           <span className="sm:hidden">Log</span>
                           <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sellingOrders.length === 0 ? (
             <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
               <Package size={64} className="mx-auto text-gray-100 mb-6" />
               <h3 className="text-2xl font-bold text-gray-900 mb-2">No sales yet</h3>
               <p className="text-gray-500">Items you sell will appear here as orders.</p>
             </div>
          ) : (
            sellingOrders.map(order => (
              <div key={order.id} className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm flex flex-col md:flex-row gap-8 md:items-center group hover:shadow-xl transition-all">
                <div className="w-24 h-24 bg-editorial-bg rounded-[32px] flex items-center justify-center border border-black/5">
                   <CategoryIcon category={order.productTitle} size={40} className="text-primary/20" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <StatusBadge status={order.status} />
                    <span className="text-[10px] text-editorial-text/30 font-black uppercase tracking-widest leading-none">Sale #{order.id.slice(-5)}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-black text-editorial-text group-hover:text-primary transition-colors italic">{order.productTitle}</h3>
                  <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] text-editorial-text/50 font-black uppercase tracking-[0.15em]">
                    <span className="flex items-center space-x-2 bg-black/5 px-3 py-1.5 rounded-lg"><Package size={14}/> <span>UNIT QTY: {order.quantity}</span></span>
                    {order.phone && (
                      <span className="flex items-center space-x-2 bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                        <span>CONTACT: {order.phone}</span>
                      </span>
                    )}
                    <span className="text-editorial-text font-serif italic text-2xl normal-case tracking-normal">₱{order.totalPrice}</span>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                    className="bg-editorial-text text-white font-black uppercase tracking-widest px-8 py-4 rounded-full text-[10px] hover:bg-black transition-all appearance-none cursor-pointer outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="READY">READY</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
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
  return <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}>{status}</span>;
}

// Final export of views
// (Already exported at function definition)
