import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_DIMENSION = 600;

interface ConfirmBody {
  path?: string;
}

// Step 3 of the direct-to-Supabase upload flow: the browser already
// uploaded the real file straight to Supabase Storage (step 2, via
// uploadToSignedUrl — never touched our server). Since that means we
// never got to sniff the real bytes before the file existed, we do it
// now instead: fetch the just-uploaded object back from Supabase
// (server-to-server, not subject to Vercel's 4.5MB *incoming request*
// body limit — that only applies to what the browser sends to us) and
// run the same validation the old single-request proxy upload used to
// do inline. A file that fails here is deleted immediately, so a client
// that skips its own pre-upload checks can't leave junk in the bucket.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<ConfirmBody>;
  const path = body.path;
  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: publicUrlData } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

  async function reject(message: string) {
    await supabaseAdmin.storage.from(SUPABASE_BUCKET).remove([path!]);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    const res = await fetch(publicUrlData.publicUrl);
    if (!res.ok) return await reject("Yuklangan fayl topilmadi");
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return await reject("Yuklangan faylni tekshirib bo'lmadi");
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    return await reject("Fayl hajmi 10MB dan katta");
  }

  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return await reject("Fayl rasm sifatida tanilmadi");
  }

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    return await reject("Faqat JPG, PNG yoki WebP");
  }
  if (!metadata.width || !metadata.height || metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
    return await reject(`Rasm juda kichik (kamida ${MIN_DIMENSION}×${MIN_DIMENSION}px)`);
  }

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
