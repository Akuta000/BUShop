/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env/secrets.');
}

// Clean URL: Remove trailing /rest/v1/ and whitespace
supabaseUrl = supabaseUrl?.trim()?.replace(/["']/g, '') || '';

// Debug logging for configuration state
if (import.meta.env.DEV) {
  console.log('Supabase Configuration Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 15) : 'none'
  });
}

if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1', '');
}
if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

// Ensure URL is a valid URL or fallback to a placeholder that won't crash but will fail fetch gracefully
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = (supabaseAnonKey?.trim()?.replace(/["']/g, '')) || 'placeholder';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false
  }
});
