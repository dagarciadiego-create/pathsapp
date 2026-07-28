import { Plus } from "lucide-react";
import { Button } from "./form";

export function Section({
  title,
  subtitle,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  subtitle?: string;
  addLabel?: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {onAdd && addLabel && (
          <Button variant="secondary" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
