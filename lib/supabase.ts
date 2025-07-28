import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Runtime error checking (only when actually using the client)
const validateEnvironment = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
}

// For client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Validate environment on first use
let environmentValidated = false
const validateOnce = () => {
  if (!environmentValidated && typeof window !== 'undefined') {
    validateEnvironment()
    environmentValidated = true
  }
}

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

// Helper function to get validated supabase client
export const getSupabaseClient = () => {
  validateOnce()
  return supabase
}
