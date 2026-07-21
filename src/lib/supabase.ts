import { createClient, SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// Server-only client using the service role key (bypasses RLS) — used for
// admin-authenticated uploads. Never import this from client components.
//
// Built lazily (on first use), not at module load. supabase-js validates
// the URL eagerly inside createClient() — constructing it at module scope
// meant Next.js's build-time "collect page data" step (which imports every
// route module to read its config, even ones that never prerender) ran
// createClient() during `next build`, before env vars were necessarily
// resolved, and crashed the whole build.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!cached) {
    // We only use Storage here, but supabase-js always spins up a Realtime
    // client internally, which needs a WebSocket constructor — Node 20 has
    // no global WebSocket, so without this the client throws at construction time.
    cached = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      realtime: { transport: WebSocket as unknown as never },
    });
  }
  return cached;
}

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET_NAME!;
