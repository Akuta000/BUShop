/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Search, ShoppingBag, Bell, User, LayoutDashboard } from 'lucide-react';
import { useStore } from '../lib/store';

interface NavItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ icon: Icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 py-2 transition-all relative tap-highlight-transparent ${
        active ? 'text-primary scale-110' : 'text-editorial-text/30 hover:text-editorial-text'
      }`}
    >
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-primary/10' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{label}</span>
      {badge ? (
        <span className="absolute top-0 right-1/4 bg-primary text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg shadow-orange-500/30">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

export function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: any) => void }) {
  const { currentUser } = useStore();
  const isSeller = currentUser?.role === 'SELLER' || currentUser?.role === 'ORGANIZATION';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-black/5 px-4 pt-2 pb-6 z-50 md:hidden safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className={`max-w-md mx-auto grid ${isSeller ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
        <NavItem
          icon={Home}
          label="Market"
          active={activeTab === 'home'}
          onClick={() => onTabChange('home')}
        />
        <NavItem
          icon={Search}
          label="Browse"
          active={activeTab === 'search'}
          onClick={() => onTabChange('search')}
        />
        {isSeller && (
          <NavItem
            icon={LayoutDashboard}
            label="Hub"
            active={activeTab === 'seller'}
            onClick={() => onTabChange('seller')}
          />
        )}
        <NavItem
          icon={ShoppingBag}
          label="Orders"
          active={activeTab === 'orders'}
          onClick={() => onTabChange('orders')}
        />
        <NavItem
          icon={User}
          label="User"
          active={activeTab === 'profile'}
          onClick={() => onTabChange('profile')}
        />
      </div>
    </nav>
  );
}

export function SideNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: any) => void }) {
  const { currentUser, notifications } = useStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isSeller = currentUser?.role === 'SELLER' || currentUser?.role === 'ORGANIZATION';

  const items: { id: string; icon: any; label: string; hide?: boolean; badge?: number }[] = [
    { id: 'home', icon: Home, label: 'Marketplace' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'seller', icon: LayoutDashboard, label: 'Seller Hub', hide: !isSeller },
    { id: 'orders', icon: ShoppingBag, label: 'Order History' },
    { id: 'profile', icon: User, label: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-black/5 p-10 z-40">
      <div className="flex items-center space-x-3 mb-16">
        <h1 className="text-4xl font-serif font-black tracking-tighter italic text-primary">BUSHOP</h1>
      </div>

      <div className="space-y-3 flex-grow">
        <p className="text-[9px] font-black text-editorial-text/30 uppercase tracking-[0.3em] ml-4 mb-4">Main Menu</p>
        {items.filter(i => !i.hide).map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-full transition-all relative group ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-2xl shadow-orange-500/20'
                : 'text-editorial-text/40 hover:bg-black/5 hover:text-editorial-text'
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
            <span className="font-black uppercase tracking-[0.15em] text-[10px]">{item.label}</span>
            {item.badge ? (
              <span className={`ml-auto text-[9px] font-black rounded-full min-w-5 h-5 flex items-center justify-center px-1 border ${activeTab === item.id ? 'bg-white/20 border-white/40 text-white' : 'bg-primary border-primary text-white shadow-lg shadow-orange-500/20'}`}>
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="pt-8 mt-8 border-t border-black/5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-editorial-bg flex items-center justify-center border border-black/5 shadow-sm">
            <User size={20} className="text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-editorial-text truncate">{currentUser?.name || 'Guest User'}</p>
            <p className="text-[10px] font-black text-editorial-text/30 uppercase tracking-widest truncate">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
