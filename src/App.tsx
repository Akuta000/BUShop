/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppStoreProvider, useStore } from './lib/store';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav, SideNav } from './components/Navigation';
import { HomeView, SearchView, ProductDetail } from './views/MarketplaceViews';
import { OrdersView } from './views/OrdersViews';
import { SellerHubView } from './views/SellerHubView';
import { ProfileView } from './views/UtilityViews';
import { Product } from './types';

function AppContent() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'orders' | 'seller' | 'profile'>('home');
  const [preferredOrdersTab, setPreferredOrdersTab] = useState<'BUYING' | 'SELLING' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleTabChangeWithPreference = (tab: 'home' | 'search' | 'orders' | 'seller' | 'profile', subTab?: 'BUYING' | 'SELLING') => {
    setActiveTab(tab);
    if (subTab) {
      setPreferredOrdersTab(subTab);
    } else {
      setPreferredOrdersTab(null);
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home': return <HomeView onSelectProduct={setSelectedProduct} onTabChange={handleTabChangeWithPreference} />;
      case 'search': return <SearchView onSelectProduct={setSelectedProduct} />;
      case 'orders': return <OrdersView initialTab={preferredOrdersTab || undefined} />;
      case 'seller': return <SellerHubView />;
      case 'profile': return <ProfileView />;
      default: return <HomeView onSelectProduct={setSelectedProduct} onTabChange={handleTabChangeWithPreference} />;
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg font-sans antialiased text-editorial-text selection:bg-orange-100 selection:text-primary">
      {/* Layout Containers */}
      <div className="flex">
        <SideNav activeTab={activeTab} onTabChange={(t) => handleTabChangeWithPreference(t)} />
        
        <main className="flex-grow md:ml-72 min-h-screen">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 pt-12 sm:pt-20 md:pt-24 lg:pt-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={(t) => handleTabChangeWithPreference(t)} />
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}
