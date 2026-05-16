/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Order, Review, Notification, UserRole, OrderStatus } from '../types';
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_NOTIFICATIONS, MOCK_REVIEWS } from './mockData';
import { supabase } from './supabase';

interface AppState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  notifications: Notification[];
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, username: string, role: UserRole, schoolId: string) => Promise<{ error: string | null }>;
  addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (productId: string, quantity: number, notes: string, paymentMethod: 'COD' | 'MEETUP') => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
  addReview: (productId: string, rating: number, comment: string) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  uploadImage: (file: File) => Promise<{ url: string | null; error: any }>;
}

const StoreContext = createContext<AppContextType | undefined>(undefined);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('shopbu_state');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentUser: null,
      users: MOCK_USERS,
      products: MOCK_PRODUCTS,
      orders: MOCK_ORDERS,
      reviews: MOCK_REVIEWS,
      notifications: MOCK_NOTIFICATIONS,
    };
  });

  useEffect(() => {
    localStorage.setItem('shopbu_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    // Check if Supabase URL is set and not a placeholder
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                !import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');
                                
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping profile fetch');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const user: User = {
          id: data.id,
          name: data.full_name,
          username: data.username,
          email: state.currentUser?.email || '', 
          role: data.role as UserRole,
          schoolId: data.school_id,
          createdAt: data.created_at,
        };
        setState(prev => ({ ...prev, currentUser: user }));
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error?.message?.includes('Failed to fetch')) {
        return { error: 'Connection Error: Please check if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set in the Secrets panel.' };
      }
      return { error: error?.message || null };
    } catch (err: any) {
      console.error('Login error:', err);
      return { error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const register = async (name: string, email: string, password: string, username: string, role: UserRole, schoolId: string) => {
    try {
      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Failed to fetch')) {
          return { error: 'Connection Error: Please check your Supabase Secrets configuration.' };
        }
        return { error: authError.message };
      }
      if (!data.user) return { error: 'Failed to create user' };

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            username,
            full_name: name,
            role,
            school_id: schoolId,
          },
        ]);

      if (profileError) {
        return { error: `Profile Creation Failed: ${profileError.message}. Make sure you ran the SQL schema in Supabase.` };
      }

      return { error: null };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { error: err.message || 'An unexpected error occurred during registration.' };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.currentUser) return { error: 'Not authenticated' };
    
    try {
      const dbUpdates: any = {};
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.name) dbUpdates.full_name = updates.name;
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', state.currentUser.id);

      if (!error) {
        setState(prev => ({
          ...prev,
          currentUser: prev.currentUser ? { ...prev.currentUser, ...updates } : null
        }));
      }
      return { error };
    } catch (err: any) {
      console.error('Profile update failed:', err);
      return { error: err.message };
    }
  };

  const addProduct = (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount'>) => {
    if (!state.currentUser) return;
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name,
      rating: 0,
      reviewCount: 0
    };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const placeOrder = (productId: string, quantity: number, notes: string, paymentMethod: 'COD' | 'MEETUP') => {
    if (!state.currentUser) return;
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const newOrder: Order = {
      id: `o-${Date.now()}`,
      buyerId: state.currentUser.id,
      productId: product.id,
      productTitle: product.title,
      sellerId: product.sellerId,
      quantity,
      status: 'PENDING',
      notes,
      paymentMethod,
      totalPrice: product.price * quantity,
      createdAt: new Date().toISOString()
    };

    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      userId: product.sellerId,
      message: `New order from ${state.currentUser.name} for ${product.title}`,
      isRead: false,
      type: 'ORDER_UPDATE',
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      orders: [...prev.orders, newOrder],
      notifications: [newNotification, ...prev.notifications],
      // Decrement stock
      products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p)
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    // If order was already cancelled, don't do anything (prevents double stock return)
    if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
        // Technically we might want to decrement stock if it moves FROM cancelled, but UI doesn't allow this
    }

    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      userId: order.buyerId,
      message: `Your order for ${order.productTitle} is now ${status.toLowerCase()}`,
      isRead: false,
      type: 'ORDER_UPDATE',
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const nextOrders = prev.orders.map(o => o.id === orderId ? { ...o, status } : o);
      let nextProducts = prev.products;

      // Handle stock reversal if cancelled
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        nextProducts = prev.products.map(p => 
          p.id === order.productId ? { ...p, stock: p.stock + order.quantity } : p
        );
      }

      return {
        ...prev,
        orders: nextOrders,
        notifications: [newNotification, ...prev.notifications],
        products: nextProducts
      };
    });
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    if (!state.currentUser) return;
    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId,
      buyerId: state.currentUser.id,
      buyerName: state.currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      reviews: [...prev.reviews, newReview],
      products: prev.products.map(p => {
        if (p.id === productId) {
          const newReviewCount = p.reviewCount + 1;
          const newRating = (p.rating * p.reviewCount + rating) / newReviewCount;
          return { ...p, rating: parseFloat(newRating.toFixed(1)), reviewCount: newReviewCount };
        }
        return p;
      })
    }));
  };

  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  };

  const deleteNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const uploadImage = async (file: File) => {
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                !import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');
                                
    if (!isSupabaseConfigured) {
      // Fallback: Convert to base64 for local dev if Supabase is not ready
      return new Promise<{ url: string | null; error: any }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ url: reader.result as string, error: null });
        reader.onerror = () => resolve({ url: null, error: 'File read error' });
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${state.currentUser?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, fallback to base64 so the app still works
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('Bucket not found')) {
          console.warn('Supabase storage bucket "product-images" not found. Falling back to local data URL.');
          return new Promise<{ url: string | null; error: any }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ url: reader.result as string, error: null });
            reader.readAsDataURL(file);
          });
        }
        return { url: null, error: uploadError };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error('Upload failed:', err);
      return { url: null, error: err.message };
    }
  };

  return (
    <StoreContext.Provider value={{
      ...state,
      login,
      logout,
      register,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProfile,
      placeOrder,
      updateOrderStatus,
      addReview,
      markNotificationRead,
      deleteNotification,
      uploadImage
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppStoreProvider');
  }
  return context;
}
