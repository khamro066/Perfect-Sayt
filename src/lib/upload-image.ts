import { getSupabaseBrowser } from "./supabase-browser";

interface MintResponse {
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
}

// Uploads a single image file directly to Supabase Storage from the
// browser -- the file bytes never pass through our own server, so
// Vercel's 4.5MB serverless function request-body limit never applies.
// Three steps: (1) ask our server for a signed, single-use upload token
// scoped to one path, (2) upload the real bytes straight to Supabase with
// that token, (3) ask our server to verify the real uploaded bytes
// (format/dimensions, since it never got to check them beforehand) and
// hand back the public URL. Throws an Error with a user-facing message
// on failure at any step.
export async function uploadImageDirect(file: File): Promise<string> {
  const mintRes = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  const mintData = (await mintRes.json()) as Partial<MintResponse> & { error?: string };
  if (!mintRes.ok || !mintData.token || !mintData.path || !mintData.bucket) {
    throw new Error(mintData.error ?? `${file.name}: rasm yuklanmadi`);
  }

  const supabase = getSupabaseBrowser();
  const { error: uploadError } = await supabase.storage
    .from(mintData.bucket)
    .uploadToSignedUrl(mintData.path, mintData.token, file);
  if (uploadError) {
    throw new Error(`${file.name}: rasm yuklanmadi`);
  }

  const confirmRes = await fetch("/api/admin/upload-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: mintData.path }),
  });
  const confirmData = (await confirmRes.json()) as { url?: string; error?: string };
  if (!confirmRes.ok || !confirmData.url) {
    throw new Error(confirmData.error ?? `${file.name}: rasm yuklanmadi`);
  }

  return confirmData.url;
}
