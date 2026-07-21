import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_DIMENSION = 600;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: `${file.name}: fayl hajmi 5MB dan katta` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Never trust the client-declared MIME type / extension — sniff the real
  // format and dimensions from the file bytes themselves.
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return NextResponse.json({ error: `${file.name}: fayl rasm sifatida tanilmadi` }, { status: 400 });
  }

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    return NextResponse.json({ error: `${file.name}: faqat JPG, PNG yoki WebP` }, { status: 400 });
  }
  if (!metadata.width || !metadata.height || metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
    return NextResponse.json({ error: `${file.name}: rasm juda kichik (kamida 600×600px)` }, { status: 400 });
  }

  const ext = metadata.format === "jpeg" ? "jpg" : metadata.format;
  const filename = `${randomUUID()}.${ext}`;

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).upload(filename, buffer, {
    contentType: `image/${metadata.format}`,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: `${file.name}: rasm yuklashda xatolik yuz berdi` }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
