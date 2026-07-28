import { clsx } from "clsx";

export function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color =
    clamped >= 100
      ? "bg-emerald-500"
      : clamped >= 50
        ? "bg-teal-500"
        : clamped > 0
          ? "bg-amber-500"
          : "bg-slate-300 dark:bg-slate-600";

  return (
    <div
      className={clsx(
        "h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx("h-full rounded-full transition-all", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
