import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Add error checking for required client-side variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// For client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (with service role key) - optional
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only create admin client if service role key is available
export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper function to check if admin client is available
export const isAdminAvailable = (): boolean => {
  return supabaseAdmin !== null
}

// Helper function to get admin client with error checking
export const getAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }
  return supabaseAdmin
}
