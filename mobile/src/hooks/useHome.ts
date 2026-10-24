import { getTipOfTheDay } from '@/api/healthTips';

// Replaces lib/providers/home_provider.dart. The news feed, survivor stories and
// wellness reminder cards were removed in the redesign (docs/redesign).

/** Same tip all day. */
export function useDailyHealthTip() {
  return getTipOfTheDay();
}
