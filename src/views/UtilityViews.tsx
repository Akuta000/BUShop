/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, User, LogOut, Shield, ChevronRight, HelpCircle, Laptop } from 'lucide-react';
import { useStore } from '../lib/store';

// --- NOTIFICATIONS VIEW ---

export function NotificationsView() {
  const { notifications, markNotificationRead, deleteNotification, currentUser } = useStore();

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-serif font-black italic tracking-tighter text-editorial-text mb-2">Bulletins</h1>
        <p className="text-editorial-text/60 font-medium tracking-tight text-sm sm:text-base">Updates on trade and orders.</p>
      </header>

      <div className="space-y-4">
        {userNotifications.length === 0 ? (
          <div className="bg-white border border-black/5 p-16 rounded-[48px] text-center">
            <Bell size={48} className="mx-auto text-editorial-text/10 mb-6" />
            <p className="text-editorial-text/30 font-black uppercase tracking-widest text-xs">No pending directives</p>
          </div>
        ) : (
          <AnimatePresence>
            {userNotifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-black/5 flex flex-col sm:flex-row items-start gap-4 sm:gap-8 transition-all group ${
                  !notification.isRead ? 'bg-white shadow-xl shadow-orange-500/5' : 'bg-transparent text-editorial-text/40'
                }`}
              >
                <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl ${!notification.isRead ? 'bg-primary text-white' : 'bg-black/5 text-editorial-text/20'}`}>
                  <Bell size={20} className="sm:hidden" />
                  <Bell size={24} className="hidden sm:block" />
                </div>
                <div className="flex-grow">
                   <div className="flex items-center justify-between gap-4 mb-1 sm:mb-2">
                     <h3 className="text-lg sm:text-xl font-serif font-black italic">Directive</h3>
                     <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-30">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <p className="text-sm sm:text-base font-medium leading-relaxed max-w-2xl">{notification.message}</p>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {!notification.isRead && (
                    <button onClick={() => markNotificationRead(notification.id)} className="p-3 bg-primary text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-orange-500/20">
                      <Check size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notification.id)} className="p-3 bg-black/5 text-editorial-text/40 rounded-2xl hover:bg-black/10 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// --- PROFILE VIEW ---

export function ProfileView() {
  const { currentUser, logout, users, orders } = useStore();

  const isAdmin = currentUser?.role === 'ADMIN';

  const sections = [
    { label: 'Security', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Device History', icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Help & Support', icon: HelpCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-8 sm:pb-12 gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[40px] sm:rounded-[60px] bg-white border border-black/10 flex items-center justify-center text-primary shadow-xl relative overflow-hidden group">
            <User size={60} strokeWidth={1} className="sm:hidden" />
            <User size={80} strokeWidth={1} className="hidden sm:block" />
          </div>
          <div className="text-center sm:text-left">
             <div className="flex items-center justify-center sm:justify-start space-x-3 mb-3 sm:mb-4">
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary text-white text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20">{currentUser?.role}</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tighter text-editorial-text mb-1 sm:mb-2 italic leading-none">{currentUser?.name}</h1>
             <p className="text-base sm:text-xl font-medium text-editorial-text/50 lowercase italic">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full sm:w-fit px-8 py-4 sm:px-10 sm:py-5 bg-white border border-black/5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
        >
          End Session
        </button>
      </header>

      {isAdmin && (
        <div className="space-y-8">
          <div className="bg-editorial-text text-white p-12 rounded-[60px] shadow-2xl shadow-black/20 group relative overflow-hidden">
             <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-10">
                 <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Central Intelligence</p>
                    <h2 className="text-4xl font-serif font-black italic flex items-center tracking-tighter">
                      <Shield size={32} className="mr-4 text-primary" />
                      <span>Admin Command Center</span>
                    </h2>
                    <p className="text-white/60 mt-2 font-medium italic">Monitoring {users.length} citizens and {orders.length} campus exchanges.</p>
                 </div>
                 <button className="bg-white/10 hover:bg-primary px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">Sync Data Archives</button>
               </div>
               <div className="grid grid-cols-2 gap-8">
                 <div className="bg-white/5 p-8 rounded-[40px] border border-white/10">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Inventory Reach</p>
                   <h4 className="text-4xl font-serif italic font-black">4,287 <span className="text-xl italic opacity-40">Items</span></h4>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[40px] border border-white/10">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Trade Volume</p>
                   <h4 className="text-4xl font-serif italic font-black">₱1.2M <span className="text-xl italic opacity-40">Monthly</span></h4>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-black/5 p-10 rounded-[48px]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">Registered Entities</h3>
              <div className="space-y-6">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between border-b border-black/5 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-editorial-bg flex items-center justify-center font-serif italic font-black text-primary border border-black/5">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-editorial-text">{user.name}</p>
                        <p className="text-[10px] text-editorial-text/40 font-medium">{user.role}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-black/5 p-10 rounded-[48px]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8">System Velocity</h3>
              <div className="space-y-6">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b border-black/5 pb-4">
                    <div>
                      <p className="text-[10px] font-black text-editorial-text uppercase tracking-widest mb-1">{order.productTitle}</p>
                      <p className="text-[9px] text-editorial-text/40 font-medium">₱{order.totalPrice} • {order.paymentMethod}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map(s => (
          <button key={s.label} className="bg-white p-10 rounded-[48px] border border-black/5 shadow-sm flex items-center justify-between hover:scale-105 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-editorial-bg translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-3xl bg-editorial-bg ${s.color} group-hover:bg-primary group-hover:text-white transition-colors`}>
                <s.icon size={32} strokeWidth={1.5} />
              </div>
              <span className="font-serif font-black text-editorial-text italic text-xl tracking-tight">{s.label}</span>
            </div>
            <ChevronRight size={24} className="text-editorial-text/10 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
