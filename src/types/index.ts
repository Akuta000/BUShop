/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'BUYER' | 'SELLER' | 'ORGANIZATION' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  schoolId: string;
  createdAt: string;
  avatar?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUri: string;
  isService: boolean;
  rating: number;
  reviewCount: number;
}

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  quantity: number;
  status: OrderStatus;
  notes: string;
  paymentMethod: 'COD' | 'MEETUP' | 'GCASH' | 'PAYPAL';
  totalPrice: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  type: 'ORDER_UPDATE' | 'LOW_STOCK' | 'SYSTEM';
  createdAt: string;
}
