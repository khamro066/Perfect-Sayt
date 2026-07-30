import clsx from "clsx";
import { Image as ImageIcon } from "lucide-react";

export function PlaceholderImage({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-surface-2 p-2 text-center",
        className
      )}
    >
      <ImageIcon size={20} strokeWidth={1.75} className="shrink-0 text-ink/40" />
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink/60">{label}</span>
    </div>
  );
}
