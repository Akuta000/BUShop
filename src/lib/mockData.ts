/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Product, Order, Review, Notification } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'seller-1',
    name: 'Juan Dela Cruz',
    username: 'juan_dc',
    email: 'juan.delacruz@bicol-u.edu.ph',
    role: 'SELLER',
    schoolId: '2021-12345',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-1',
    name: 'BU Computer Science Society',
    username: 'bu_css',
    email: 'css@bicol-u.edu.ph',
    role: 'ORGANIZATION',
    schoolId: 'ORG-CSS-2024',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'buyer-1',
    name: 'Maria Santos',
    username: 'mariasan',
    email: 'maria.santos@bicol-u.edu.ph',
    role: 'BUYER',
    schoolId: '2022-54321',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    name: 'BUSHOP Admin',
    username: 'admin',
    email: 'admin@bicol-u.edu.ph',
    role: 'ADMIN',
    schoolId: 'ADMIN-001',
    createdAt: new Date().toISOString(),
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz',
    title: 'BU College Hoodie',
    description: 'High-quality cotton hoodie with Bicol University embroidery. Perfect for rainy campus days.',
    price: 850,
    stock: 15,
    category: 'Apparel',
    imageUri: '',
    isService: false,
    rating: 4.8,
    reviewCount: 12
  },
  {
    id: 'p2',
    sellerId: 'org-1',
    sellerName: 'BU Computer Science Society',
    title: 'CSS Tech Stickers (Pack of 5)',
    description: 'Waterproof vinyl stickers featuring programming jokes and BU CSS branding.',
    price: 50,
    stock: 100,
    category: 'Merchandise',
    imageUri: '',
    isService: false,
    rating: 5.0,
    reviewCount: 45
  },
  {
    id: 'p3',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz',
    title: 'Python Tutoring (1hr)',
    description: 'One-on-one Python tutoring for beginners. Can cover loops, data structures, and basic algorithms.',
    price: 200,
    stock: 5,
    category: 'Services',
    imageUri: '',
    isService: true,
    rating: 4.9,
    reviewCount: 8
  },
  {
    id: 'p4',
    sellerId: 'seller-1',
    sellerName: 'Juan Dela Cruz',
    title: 'Organic Notebook - Recycled',
    description: 'Eco-friendly notebook made from 100% recycled paper. 80 pages, grid ruled.',
    price: 120,
    stock: 30,
    category: 'Stationery',
    imageUri: '',
    isService: false,
    rating: 4.5,
    reviewCount: 5
  },
  {
    id: 'p5',
    sellerId: 'org-1',
    sellerName: 'BU Computer Science Society',
    title: 'Lanyard - CSS Limited Edition',
    description: 'Premium quality lanyard with safety break-away clip. CS Society exclusive design.',
    price: 150,
    stock: 2,
    category: 'Accessory',
    imageUri: '',
    isService: false,
    rating: 4.7,
    reviewCount: 20
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    buyerId: 'buyer-1',
    productId: 'p1',
    productTitle: 'BU College Hoodie',
    sellerId: 'seller-1',
    quantity: 1,
    status: 'COMPLETED',
    notes: 'Please pick up at the CS Building Lobby.',
    paymentMethod: 'COD',
    totalPrice: 850,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'o2',
    buyerId: 'buyer-1',
    productId: 'p2',
    productTitle: 'CSS Tech Stickers (Pack of 5)',
    sellerId: 'org-1',
    quantity: 2,
    status: 'PENDING',
    notes: 'Meet up at the student plaza at 3pm.',
    paymentMethod: 'MEETUP',
    totalPrice: 100,
    createdAt: new Date().toISOString()
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    buyerId: 'buyer-1',
    buyerName: 'Maria Santos',
    rating: 5,
    comment: 'Super comfy and the embroidery is high quality!',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'seller-1',
    message: 'New order received for BU College Hoodie!',
    isRead: false,
    type: 'ORDER_UPDATE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    userId: 'buyer-1',
    message: 'Your order for BU College Hoodie has been completed.',
    isRead: true,
    type: 'ORDER_UPDATE',
    createdAt: new Date().toISOString()
  }
];
