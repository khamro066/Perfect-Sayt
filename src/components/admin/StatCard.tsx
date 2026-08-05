import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

export function StatCard({
  label,
  value,
  changePct,
}: {
  label: string;
  value: string;
  changePct?: number | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5.5">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-2xl font-bold text-ink">{value}</span>
        {changePct === null && <span className="text-[12.5px] font-semibold text-muted">Yangi</span>}
        {typeof changePct === "number" && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-[12.5px] font-semibold",
              changePct >= 0 ? "text-success" : "text-danger"
            )}
          >
            {changePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(Math.round(changePct))}%
          </span>
        )}
      </div>
    </div>
  );
}
