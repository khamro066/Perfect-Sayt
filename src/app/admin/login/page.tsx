"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await signIn("credentials", { password, redirect: false });
    setSubmitting(false);
    if (result?.error) {
      showToast("Parol noto'g'ri");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[400px] flex-col gap-4.5 rounded-block border border-line bg-surface p-9 shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
      >
        <div className="flex justify-center">
          <Image
            src="/brand/perfect-logo-white.png"
            alt="Perfect"
            width={101}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="text-center">
          <p className="font-bold text-ink">Admin panelga kirish</p>
          <p className="mt-1.5 text-[13.5px] text-muted">Faqat administratorlar uchun</p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Parol
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolni kiriting"
            className="rounded-btn border border-line bg-bg px-3.5 py-3 text-sm text-ink outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-accent-ink disabled:opacity-60"
        >
          {submitting ? "Tekshirilmoqda…" : "Kirish"}
        </button>
        <Link href="/" className="text-center text-[13px] text-muted hover:text-ink">
          ← Do&apos;konga qaytish
        </Link>
      </form>
    </div>
  );
}
