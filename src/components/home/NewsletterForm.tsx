"use client";

import { useState } from "react";
import { useToast } from "@/lib/toast-context";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  return (
    <form
      className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        showToast("Obuna uchun rahmat!");
        setEmail("");
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email manzilingiz"
        className="min-w-[220px] flex-1 rounded-btn border border-line bg-surface px-4 py-3 text-sm outline-none"
      />
      <button type="submit" className="rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
        Obuna bo&apos;lish
      </button>
    </form>
  );
}
