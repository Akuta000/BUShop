/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, GraduationCap, ArrowRight, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { UserRole } from '../types';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [schoolId, setSchoolId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, register, isAuthLoading, profileError } = useStore();
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && 
                      !!import.meta.env.VITE_SUPABASE_ANON_KEY && 
                      !import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-editorial-text/30">Syncing Identity...</p>
        </div>
      </div>
    );
  }

  if (import.meta.env.DEV) {
    console.log('Auth Configuration:', { isConfigured, url: import.meta.env.VITE_SUPABASE_URL });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isLogin) {
      const { error } = await login(email, password);
      if (error) setError(error);
    } else {
      const { error } = await register(name, email, password, username, role, schoolId);
      if (error) setError(error);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[40px] sm:rounded-[60px] shadow-2xl shadow-black/5 p-6 sm:p-12 relative overflow-hidden border border-black/5"
      >
        {/* Aesthetic decoration from theme */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center space-x-4 mb-8 sm:mb-12 border-b border-black/5 pb-6 sm:pb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl sm:rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-orange-500/30">
              <GraduationCap size={32} strokeWidth={1.5} className="sm:hidden" />
              <GraduationCap size={40} strokeWidth={1.5} className="hidden sm:block" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tighter italic text-primary">ShopBU</h1>
              <p className="text-[8px] sm:text-[10px] text-editorial-text/30 font-black uppercase tracking-[0.3em]">Marketplace</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-editorial-text mb-6 sm:mb-8 leading-tight tracking-tighter italic">
                {isLogin ? 'Login' : 'Join Us'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {(!isConfigured && !error) && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center">
                    <Shield size={16} className="mr-3 shrink-0" />
                    <span>Archive Offline: Missing Supabase configuration in .env or Secrets.</span>
                  </div>
                )}
                {(error || profileError) && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-3xl text-sm font-medium flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        {profileError === 'PROFILE_MISSING' ? (
                          <div className="space-y-1">
                            <p className="font-bold uppercase text-[10px] tracking-widest leading-none mb-1">Identity Sync Required</p>
                            <p className="text-xs leading-relaxed opacity-80 normal-case font-normal">
                              Your authentication exists, but your marketplace profile is missing. 
                              This happens if database tables were reset. 
                              Please complete your registration to fix this.
                            </p>
                          </div>
                        ) : (
                          <span>{error || profileError}</span>
                        )}
                      </div>
                    </div>
                    {profileError === 'PROFILE_MISSING' && (
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        Complete Profile Now
                      </button>
                    ) || profileError && (
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="bg-red-600 text-white px-4 py-2 rounded-full text-[8px] self-start"
                      >
                        Fix Account / Recreate Profile
                      </button>
                    )}
                  </div>
                )}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="FULL NAME"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Username</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all lowercase"
                          placeholder="jdelacruz"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Account Type</label>
                        <div className="relative">
                          <select
                            value={role}
                            onChange={e => setRole(e.target.value as UserRole)}
                            className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none uppercase tracking-widest"
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="SELLER">SELLER</option>
                            <option value="ORGANIZATION">ORGANIZATION</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Student ID</label>
                        <input
                          type="text"
                          required
                          value={schoolId}
                          onChange={e => setSchoolId(e.target.value)}
                          className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                          placeholder="2024-000000"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all lowercase"
                      placeholder="user@bicol-u.edu.ph"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-editorial-text/30 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-editorial-bg border border-black/5 rounded-full px-8 py-5 text-editorial-text font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {!isLogin && (
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 ml-1 italic opacity-60">Requires verified @bicol-u domain</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-editorial-text text-white font-black uppercase tracking-[0.3em] py-6 rounded-full shadow-2xl shadow-black/20 flex items-center justify-center space-x-4 transition-all transform active:scale-95 group hover:bg-black"
                >
                  <span className="text-xs">{isLogin ? 'Login' : 'Create Account'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-editorial-text uppercase tracking-widest flex items-center space-x-4 group"
            >
              <span className="opacity-30">{isLogin ? "Need an account?" : "Already have an account?"}</span>
              <span className="text-primary border-b-2 border-primary/20 group-hover:border-primary transition-all">{isLogin ? 'Sign Up' : 'Log In'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
