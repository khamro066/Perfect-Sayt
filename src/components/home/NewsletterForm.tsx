"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/toast-context";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  return (
    <form
      className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        showToast(t("toastThanks"));
        setEmail("");
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        className="min-w-[220px] flex-1 rounded-btn border border-line bg-surface px-4 py-3 text-sm outline-none"
      />
      <button type="submit" className="btn-press rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
        {t("subscribe")}
      </button>
    </form>
  );
}
