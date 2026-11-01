import { HEALTH_TIPS } from '@/constants/healthTips';
import type { HealthTip } from '@/types/healthTip';

// Port of lib/services/health_tips_service.dart (static data, no network).

/** The same tip all day, changing daily by day of the year. */
export function getTipOfTheDay(now: Date = new Date()): HealthTip {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.trunc((now.getTime() - startOfYear.getTime()) / 86_400_000);
  return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
}
