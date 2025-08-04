import { createClient } from "@supabase/supabase-js"

let supabaseClient: any = null

export async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("🔧 Initializing Supabase client...")
    console.log("URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
    console.log("Key:", supabaseKey ? "✓ Set" : "✗ Missing")

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase environment variables not configured")
      return null
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    console.log("✅ Supabase client initialized successfully")
    return supabaseClient
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error)
    return null
  }
}

// Create a synchronous client for immediate use
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase environment variables not configured")
    return null
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Export the synchronous client
export const supabase = createSupabaseClient()

export { supabaseClient }
