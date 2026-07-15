"use client";

import { X } from "lucide-react";

const ROWS = [
  [38, "24.0"], [39, "24.6"], [40, "25.3"], [41, "26.0"],
  [42, "26.7"], [43, "27.3"], [44, "28.0"], [45, "28.7"],
] as const;

export function SizeChartModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5" onClick={onClose}>
      <div
        className="w-full max-w-[360px] rounded-block bg-surface p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">O&apos;lcham jadvali</h3>
          <button onClick={onClose} aria-label="Yopish">
            <X size={18} className="text-muted" />
          </button>
        </div>
        <div className="grid grid-cols-2 border-b border-line pb-2 text-xs font-bold uppercase text-muted">
          <span>EU o&apos;lcham</span>
          <span>Uzunlik (sm)</span>
        </div>
        {ROWS.map(([eu, cm]) => (
          <div key={eu} className="grid grid-cols-2 border-b border-line py-2.5 text-sm text-ink">
            <span>{eu}</span>
            <span>{cm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
