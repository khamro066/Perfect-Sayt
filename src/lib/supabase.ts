import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// Server-only client using the service role key (bypasses RLS) — used for
// admin-authenticated uploads. Never import this from client components.
//
// We only use Storage here, but supabase-js always spins up a Realtime
// client internally, which needs a WebSocket constructor — Node 20 has no
// global WebSocket, so without this the client throws at construction time.
export const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: { transport: WebSocket as unknown as never },
});

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET_NAME!;
