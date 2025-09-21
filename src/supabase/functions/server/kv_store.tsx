// src/supabase/functions/server/kv_store.tsx
// Purpose: central Supabase client for server-side code (no JSR imports)

// Use the official npm package (NOT "jsr:")
import { createClient } from "@supabase/supabase-js";

// Read env vars in a way that works for both Vite and Vercel/Node.
// For Vite (client) you’d use VITE_*; for server we read process.env.
// We support both so the file won’t crash during builds.
const SUPABASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL);

const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

// Fail fast with a clear message if envs are missing during build/deploy
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_* equivalents) in your environment."
  );
}

// Create a singleton client for server-side use
export const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);

// Example: helper to get current time from DB (replace/extend as you need)
export async function pingDb() {
  const { data, error } = await supabase.rpc("now"); // requires a 'now' RPC or adjust
  if (error) throw error;
  return data;
}
