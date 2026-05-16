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
  isAuthLoading: boolean;
  profileError: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, username: string, role: UserRole, schoolId: string) => Promise<{ error: string | null }>;
  addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (productId: string, quantity: number, notes: string, paymentMethod: 'COD' | 'MEETUP', phone: string) => void;
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

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                              !import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');

  useEffect(() => {
    // 1. Initial Auth Check
    setIsAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsAuthLoading(false));
      } else {
        setIsAuthLoading(false);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
        if (isSupabaseConfigured) fetchInitialData();
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  async function fetchInitialData() {
    if (!isSupabaseConfigured) return;

    try {
      const [productsRes, ordersRes, notificationsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);

      if (productsRes.error) console.error('Products fetch error:', productsRes.error);
      if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error);

      setState(prev => {
        const newState = { ...prev };
        
        if (productsRes.data) {
          newState.products = productsRes.data.map(p => ({
            id: p.id,
            sellerId: p.seller_id,
            sellerName: p.seller_name,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            stock: Number(p.stock),
            category: p.category,
            imageUri: p.image_uri,
            isService: p.is_service,
            phone: p.phone || '',
            rating: Number(p.rating || 0),
            reviewCount: Number(p.review_count || 0)
          }));
        }

        if (ordersRes.data) {
          newState.orders = ordersRes.data.map(o => ({
            id: o.id,
            buyerId: o.buyer_id,
            sellerId: o.seller_id,
            productId: o.product_id,
            productTitle: o.product_title,
            quantity: Number(o.quantity),
            status: o.status as OrderStatus,
            notes: o.notes,
            paymentMethod: o.payment_method as any,
            phone: o.phone || '',
            totalPrice: Number(o.total_price),
            createdAt: o.created_at
          }));
        }

        if (notificationsRes.data) {
          newState.notifications = notificationsRes.data.map(n => ({
            id: n.id,
            userId: n.user_id,
            message: n.message,
            isRead: n.is_read,
            type: n.type as any,
            createdAt: n.created_at
          }));
        }

        if (reviewsRes.data) {
          newState.reviews = reviewsRes.data.map(r => ({
            id: r.id,
            productId: r.product_id,
            buyerId: r.buyer_id,
            buyerName: r.buyer_name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at
          }));
        }

        return newState;
      });
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  }

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setProfileError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === 'PGRST116') {
           setProfileError('Account found but profile is missing. This usually happens if the database was cleared but not the auth users. Please sign up again or contact support.');
           setState(prev => ({ ...prev, currentUser: null }));
        }
        return;
      }

      if (data) {
        const user: User = {
          id: data.id,
          name: data.full_name,
          username: data.username,
          email: session?.user?.email || '',
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
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          return { error: 'Connection Error: Please check your Supabase Secrets configuration.' };
        }
        return { error: error.message };
      }

      if (authData.user) {
        // Wait for profile fetch to complete
        await fetchProfile(authData.user.id);
        
        // If profile is still null after login and fetch, it means PGRST116 happened
        const currentSession = await supabase.auth.getSession();
        if (currentSession.data.session && !state.currentUser) {
           // This means the user exists in Auth but has no profile row
           return { error: 'Your account exists but your profile was not found. Try signing up with your details again to recreate your profile.' };
        }
      }

      return { error: null };
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

      let userId = data.user?.id;

      if (authError) {
        if (authError.message.includes('User already registered')) {
          // If already registered, try to sign in to get the ID
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            return { error: `This email is already registered. If it is yours, please login. If you believe this is an error, please contact support. (Auth Error: ${signInError.message})` };
          }
          userId = signInData.user?.id;
        } else if (authError.message.includes('Failed to fetch')) {
          return { error: 'Connection Error: Please check your Supabase Secrets configuration.' };
        } else {
          return { error: authError.message };
        }
      }

      if (!userId) return { error: 'Failed to identify user. Please try again.' };

      // 2. Create profile (upsert case for zombie users)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          full_name: name,
          role,
          school_id: schoolId,
        });

      if (profileError) {
        return { error: `Profile Creation Failed: ${profileError.message}. Make sure you ran the SQL schema in Supabase with RLS policies enabled.` };
      }

      // Re-fetch profile to update state
      await fetchProfile(userId);

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
        phone: product.phone,
      }]).select().single();

      if (error) throw error;
      
    } catch (err) {
      console.error('Failed to add product:', err);
      // Revert local state on error
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
      if (updates.phone) dbUpdates.phone = updates.phone;
      
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    // Keep local copy for possible revert
    const originalProducts = [...state.products];

    // Optimistic update
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));

    if (!isSupabaseConfigured) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        throw error;
      }
      // Success - real-time listener will sync or next fetchInitialData will clean up
    } catch (err) {
      console.error('Persistent Deletion Failed:', err);
      // Revert state on failure
      setState(prev => ({ ...prev, products: originalProducts }));
      alert('Failed to delete from database. Please check your permissions or connection.');
    }
  };

  const placeOrder = async (productId: string, quantity: number, notes: string, paymentMethod: 'COD' | 'MEETUP', phone: string) => {
    if (!state.currentUser) {
      alert('Please log in to place an order.');
      return false;
    }
    const product = state.products.find(p => p.id === productId);
    if (!product) return false;

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
      phone,
      totalPrice: product.price * quantity,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p)
    }));

    if (!isSupabaseConfigured) return true;

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
        phone,
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

      await fetchInitialData();
      return true;
    } catch (err) {
      console.error('Order placement failed:', err);
      // Revert on error
      setState(prev => ({
        ...prev,
        orders: prev.orders.filter(o => o.id !== tempOrderId),
        products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock + quantity } : p)
      }));
      alert('Order failed to reach the database. Please check your connection.');
      return false;
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

      // 2. Notify Opposite Party
      const isSellerAction = state.currentUser?.id === order.sellerId;
      const targetUserId = isSellerAction ? order.buyerId : order.sellerId;
      const actorName = state.currentUser?.name || 'Someone';
      
      let notificationMessage = `Your order for ${order.productTitle} is now ${status.toLowerCase()}`;
      if (!isSellerAction && status === 'COMPLETED') {
        notificationMessage = `${actorName} marked your product ${order.productTitle} as received. Transaction completed!`;
      } else if (!isSellerAction && status === 'CANCELLED') {
        notificationMessage = `${actorName} cancelled their order for ${order.productTitle}.`;
      }

      await supabase.from('notifications').insert([{
        user_id: targetUserId,
        message: notificationMessage,
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
      await fetchInitialData();
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
      isAuthLoading,
      profileError,
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
