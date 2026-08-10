"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Public client for the admin panel's direct-to-Supabase image uploads
// (bypasses our own server for the file bytes, so Vercel's 4.5MB
// serverless function request-body limit never applies). The anon key is
// safe to ship in the browser bundle by design — unlike the service-role
// key, it grants no elevated access on its own. uploadToSignedUrl() only
// works because the caller already holds a token minted server-side via
// /api/admin/upload-url (which requires an authenticated admin session).
let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return cached;
}
