"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { useNotifications } from "@/lib/notifications-context";
import { formatSom } from "@/lib/format";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, soundOn, toggleSound } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface text-ink"
        aria-label="Bildirishnomalar"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-[#c8483d] px-1 text-[10.5px] font-bold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[50px] z-50 flex max-h-[420px] w-[340px] flex-col overflow-y-auto rounded-card border border-line bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-line p-3.5">
              <span className="text-sm font-bold text-ink">Bildirishnomalar</span>
              <button onClick={toggleSound} title="Ovozni yoqish/o'chirish" className="text-muted">
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="p-7 text-center text-sm text-muted">Hozircha bildirishnoma yo&apos;q</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                    router.push(n.kind === "preorder" ? "/admin/oldindan-buyurtmalar" : "/admin/buyurtmalar");
                  }}
                  className="flex flex-col gap-0.5 border-b border-line p-3.5 text-left"
                  style={{ background: n.read ? "transparent" : "var(--accent-soft)" }}
                >
                  <div className="flex justify-between text-[13px]">
                    <span className="font-bold text-ink">{n.customerName}</span>
                    <span className="text-[11px] text-muted">{n.time}</span>
                  </div>
                  <span className="text-[12.5px] text-muted">
                    {n.productSummary} · {formatSom(n.amount)}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
