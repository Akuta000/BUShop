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
    return {
      currentUser: null,
      users: MOCK_USERS,
      products: MOCK_PRODUCTS,
      orders: MOCK_ORDERS,
      reviews: MOCK_REVIEWS,
      notifications: MOCK_NOTIFICATIONS,
    };
  });

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                              !import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');

  useEffect(() => {
    // 1. Initial Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // 2. Real-time Subscriptions
    if (isSupabaseConfigured) {
      fetchInitialData();

      const productChannel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchInitialData)
        .subscribe();

      const orderChannel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchInitialData)
        .subscribe();

      const notificationChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchInitialData)
        .subscribe();

      const reviewChannel = supabase
        .channel('public:reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchInitialData)
        .subscribe();

      return () => {
        supabase.removeChannel(productChannel);
        supabase.removeChannel(orderChannel);
        supabase.removeChannel(notificationChannel);
        supabase.removeChannel(reviewChannel);
      };
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
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

  async function fetchInitialData() {
    if (!isSupabaseConfigured) return;

    try {
      const [productsRes, ordersRes, notificationsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);

      setState(prev => ({
        ...prev,
        products: productsRes.data ? productsRes.data.map(p => ({
          id: p.id,
          sellerId: p.seller_id,
          sellerName: p.seller_name,
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          category: p.category,
          imageUri: p.image_uri,
          isService: p.is_service,
          rating: p.rating || 0,
          reviewCount: p.review_count || 0
        })) : prev.products,
        orders: ordersRes.data ? ordersRes.data.map(o => ({
          id: o.id,
          buyerId: o.buyer_id,
          sellerId: o.seller_id,
          productId: o.product_id,
          productTitle: o.product_title,
          quantity: o.quantity,
          status: o.status as OrderStatus,
          notes: o.notes,
          paymentMethod: o.payment_method as any,
          totalPrice: o.total_price,
          createdAt: o.created_at
        })) : prev.orders,
        notifications: notificationsRes.data ? notificationsRes.data.map(n => ({
          id: n.id,
          userId: n.user_id,
          message: n.message,
          isRead: n.is_read,
          type: n.type as any,
          createdAt: n.created_at
        })) : prev.notifications,
        reviews: reviewsRes.data ? reviewsRes.data.map(r => ({
          id: r.id,
          productId: r.product_id,
          buyerId: r.buyer_id,
          buyerName: r.buyer_name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at
        })) : prev.reviews
      }));
    } catch (err) {
      console.error('Data fetch failed:', err);
    }
  }

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
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
          email: '', // Email is usually managed by auth, we can append it if needed
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

  const addProduct = async (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount'>) => {
    if (!state.currentUser) return;
    
    // Optimistic / Local update for immediate feedback
    const tempId = `temp-${Date.now()}`;
    const newProduct: Product = {
      ...product,
      id: tempId,
      sellerId: state.currentUser.id,
      sellerName: state.currentUser.name,
      rating: 0,
      reviewCount: 0
    };
    
    setState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from('products').insert([{
        seller_id: state.currentUser.id,
        seller_name: state.currentUser.name,
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image_uri: product.imageUri,
        is_service: product.isService,
      }]).select().single();

      if (error) throw error;
      
      // The real-time listener will replace the temp item with the real one eventually
      // but to avoid duplication we could handle it better. 
      // For now, fetchInitialData will clean it up.
    } catch (err) {
      console.error('Failed to add product:', err);
      // Revert on error
      setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== tempId) }));
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));

    if (!isSupabaseConfigured) return;
    
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.imageUri) dbUpdates.image_uri = updates.imageUri;
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update product:', err);
      // We could revert here if we had the original state, 
      // but re-fetch will fix it.
    }
  };

  const deleteProduct = async (id: string) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));

    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const placeOrder = async (productId: string, quantity: number, notes: string, paymentMethod: 'COD' | 'MEETUP') => {
    if (!state.currentUser) return;
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Optimistic update
    const tempOrderId = `o-temp-${Date.now()}`;
    const newOrder: Order = {
      id: tempOrderId,
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

    setState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p)
    }));

    if (!isSupabaseConfigured) return;

    try {
      // 1. Create Order
      const { error: orderError } = await supabase.from('orders').insert([{
        buyer_id: state.currentUser.id,
        seller_id: product.sellerId,
        product_id: product.id,
        product_title: product.title,
        quantity,
        status: 'PENDING',
        notes,
        payment_method: paymentMethod,
        total_price: product.price * quantity
      }]);

      if (orderError) throw orderError;

      // 2. Create Notification for Seller
      await supabase.from('notifications').insert([{
        user_id: product.sellerId,
        message: `New order from ${state.currentUser.name} for ${product.title}`,
        is_read: false,
        type: 'ORDER_UPDATE'
      }]);

      // 3. Update Stock (Already done optimistically, but sync with DB)
      await supabase.from('products').update({
        stock: product.stock - quantity
      }).eq('id', productId);

    } catch (err) {
      console.error('Order placement failed:', err);
      // Revert on error
      setState(prev => ({
        ...prev,
        orders: prev.orders.filter(o => o.id !== tempOrderId),
        products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock + quantity } : p)
      }));
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o)
    }));

    if (!isSupabaseConfigured) return;

    try {
      // 1. Update Order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. Notify Buyer
      await supabase.from('notifications').insert([{
        user_id: order.buyerId,
        message: `Your order for ${order.productTitle} is now ${status.toLowerCase()}`,
        is_read: false,
        type: 'ORDER_UPDATE'
      }]);

      // 3. Revert Stock if Cancelled
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        const product = state.products.find(p => p.id === order.productId);
        if (product) {
          await supabase.from('products').update({
            stock: product.stock + order.quantity
          }).eq('id', product.id);
          
          // Local update for stock reversal
          setState(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === order.productId ? { ...p, stock: p.stock + order.quantity } : p)
          }));
        }
      }
    } catch (err) {
      console.error('Order status update failed:', err);
      // Re-fetch will naturally revert to DB state on failure
    }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    if (!state.currentUser) return;
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Optimistic update
    const tempReviewId = `r-temp-${Date.now()}`;
    const newReview: Review = {
      id: tempReviewId,
      productId,
      buyerId: state.currentUser.id,
      buyerName: state.currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      products: prev.products.map(p => {
        if (p.id === productId) {
          const newReviewCount = p.reviewCount + 1;
          const newRating = (p.rating * p.reviewCount + rating) / newReviewCount;
          return { ...p, rating: parseFloat(newRating.toFixed(1)), reviewCount: newReviewCount };
        }
        return p;
      })
    }));

    if (!isSupabaseConfigured) return;

    try {
      // 1. Add Review
      const { error: reviewError } = await supabase.from('reviews').insert([{
        product_id: productId,
        buyer_id: state.currentUser.id,
        buyer_name: state.currentUser.name,
        rating,
        comment
      }]);

      if (reviewError) throw reviewError;

      // 2. Update Product Aggregate
      const newReviewCount = product.reviewCount + 1;
      const newRating = (product.rating * product.reviewCount + rating) / newReviewCount;

      await supabase.from('products').update({
        rating: parseFloat(newRating.toFixed(1)),
        review_count: newReviewCount
      }).eq('id', productId);

    } catch (err) {
      console.error('Failed to add review:', err);
      // Revert...
    }
  };

  const markNotificationRead = async (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));

    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));

    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
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
