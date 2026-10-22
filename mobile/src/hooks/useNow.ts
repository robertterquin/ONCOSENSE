import { useEffect, useState } from 'react';

/** The current time, updated every `intervalMs` (keeps "2 minutes ago" labels fresh). */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
