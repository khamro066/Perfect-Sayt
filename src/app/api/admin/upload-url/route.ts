import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface MintBody {
  filename?: string;
  contentType?: string;
  size?: number;
}

// Step 1 of the direct-to-Supabase upload flow: the browser asks us for
// permission (a signed upload token), not for us to relay the file bytes
// themselves — this request body is tiny (just metadata), so it's nowhere
// near Vercel's 4.5MB serverless function body limit. The actual file
// upload (step 2) goes straight from the browser to Supabase Storage.
//
// The checks here are cheap, client-declared, defense-in-depth only —
// nothing stops a malicious client from lying about contentType/size in
// this request. The authoritative check happens after the real bytes
// exist, in /api/admin/upload-confirm.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<MintBody>;

  const ext = body.contentType ? ALLOWED_CONTENT_TYPES[body.contentType] : undefined;
  if (!ext) {
    return NextResponse.json({ error: "Faqat JPG, PNG yoki WebP" }, { status: 400 });
  }
  if (typeof body.size === "number" && body.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `${body.filename ?? "Fayl"}: fayl hajmi 10MB dan katta` }, { status: 400 });
  }

  const path = `${randomUUID()}.${ext}`;
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "Yuklash uchun ruxsat olinmadi" }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    bucket: SUPABASE_BUCKET,
  });
}
