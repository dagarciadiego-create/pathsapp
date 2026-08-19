"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { WORKSHOP_STORAGE_KEY } from "@/lib/workshop-challenges";

// localStorage is an external store, so it's read through
// useSyncExternalStore rather than an effect + setState: that keeps the
// server render and hydration consistent (the server snapshot is simply
// "nothing ticked") and, as a bonus, syncs across the participant's tabs.
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 'storage' only fires for *other* tabs, hence the local listener set too.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Returns the raw string (not a parsed Set) so the snapshot is referentially
// stable between renders — returning a fresh object would loop forever.
function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(WORKSHOP_STORAGE_KEY);
  } catch {
    // A blocked localStorage shouldn't break the page; nothing is ticked.
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function parse(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function useWorkshopProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const done = useMemo(() => parse(raw), [raw]);

  const write = useCallback((next: Set<string>) => {
    try {
      window.localStorage.setItem(WORKSHOP_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Ignore: ticking simply won't persist if storage is unavailable.
    }
    emit();
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = parse(getSnapshot());
      if (next.has(id)) next.delete(id);
      else next.add(id);
      write(next);
    },
    [write]
  );

  const reset = useCallback(() => write(new Set()), [write]);

  return { done, toggle, reset };
}
