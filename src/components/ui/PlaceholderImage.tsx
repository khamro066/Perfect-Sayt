import clsx from "clsx";

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
        "flex items-center justify-center bg-surface-2 text-center text-xs text-muted p-3",
        className
      )}
    >
      <span>{label}</span>
    </div>
  );
}
