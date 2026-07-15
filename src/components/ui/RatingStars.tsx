import { Star } from "lucide-react";
import clsx from "clsx";

export function RatingStars({
  rating,
  count,
  size = 16,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={clsx("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-star text-star" : "fill-none text-line"}
            />
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </div>
  );
}
