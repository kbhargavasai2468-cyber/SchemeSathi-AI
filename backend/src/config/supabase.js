import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = process.env.SUPABASE_URL || '';
// Clean url if user passed rest/v1 endpoint directly or trailing slashes
let supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY must be defined in backend/.env.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
