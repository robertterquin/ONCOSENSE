# Phase 1 — Scope Cleanup and New Navigation

**Goal:** remove everything that is out of scope and move the app onto the five-tab structure, before any restyling. Screens still look like today; they are just in their new places.
**Effort:** 3–4 days. **Branch:** `redesign/phase-1`.

Doing the cuts first means Phases 2–6 restyle only what stays.

## 1.1 Remove out-of-scope features

- [ ] **News and stories:** delete `api/news.ts`, `useCancerArticles`, `useSurvivorStory`, `components/home/ArticleCards.tsx` and the article model if nothing else uses it.
- [ ] **Saved Articles:** delete `profile/saved/articles.tsx` and the article bookmark functions in `api/bookmarks.ts` and `useBookmarks.ts`. Leave the `article_bookmarks` table alone (dropping it is a later, separate decision).
- [ ] **Wellness cards:** delete `HealthReminderCard`, `useHealthReminders`, `api/healthReminders.ts`, `types/healthReminder.ts` and `constants/defaultReminders.ts` once the daily-tip notification no longer uses them (below).
- [ ] **Notification center:** delete `app/notifications.tsx`, `stores/notificationHistoryStore.ts`, `types/appNotification.ts`, the sample notifications, the Home bell badge and long-press test. In `lib/notifications/service.ts` keep tap handling (open the related screen) but drop history recording.
- [ ] **Reminders:** keep `self_check` and `weekly_checkin` only. Remove `health_tips` (daily), `hydration`, `movement`, `sun_protection` and `forum` from `reminders.ts`, the prefs store and the switches.
  - Bump the `notification-prefs` persist `version` with a `migrate` that drops the removed keys.
  - On app start, cancel any scheduled identifier that no kept type owns (cleans up phones that already have hydration and movement reminders).
- [ ] **Settings and profile:** remove "Rate the app", the forum switch, the Test Notification row and `profile/notifications.tsx` (Profile links to Settings instead). Keep the test notification on `/dev/notifications` only.
- [ ] **Edge Function:** delete `supabase/functions/news/`. Add a note to the migration Phase 7 doc that `news` no longer needs deploying and the GNews key should be revoked.

## 1.2 New routes and tabs

| Old route | New route |
|---|---|
| `/(tabs)/home` | `/(tabs)/today` |
| `/(tabs)/info` + `/(tabs)/prevention` | `/(tabs)/learn` |
| `/(tabs)/journey` | `/(tabs)/journey` |
| `/(tabs)/forum` | `/(tabs)/community` |
| `/(tabs)/resources` | `/(tabs)/help` |
| `/cancer/[id]` | `/learn/cancer/[id]` |
| `/prevention/guide/[id]` | `/learn/check/[id]` (full screen, no longer a modal) |
| `/forum/[id]`, `/forum/ask` | `/community/[id]`, `/community/ask` |
| `/journey/add-entry`, `/journey/add-treatment` | `/journey/check-in`, `/journey/treatment` |
| `/profile/saved/questions`, `/profile/saved/resources` | `/profile/saved` (one screen; segments come in Phase 5) |
| `/profile/change-password` | `/profile/password` |

- [ ] Move the files, update every `router.push`/`Link`, `homeRouteFor`, the index redirect and `routeForNotification` (self-check → `/learn`, check-in → `/journey`).
- [ ] Tab bar: five tabs in the order Today, Learn, Journey, Community, Help, with labels always shown. Keep the current tab-bar look until Phase 2.
- [ ] **Learn (temporary):** one scrolling screen that stacks the current self-check list, cancer type list and prevention tips with the existing components. Phase 3 restyles it.
- [ ] Update the Maestro flows and tests that reference old routes or labels.

## Done when

- [ ] `grep` finds no references to the removed modules, routes or notification types.
- [ ] Lint, typecheck and tests pass; `expo export` for iOS and Android succeeds.
- [ ] On web and the iOS Simulator: five tabs, every old screen reachable at its new route, nothing removed is reachable.
- [ ] `/dev/notifications` on the simulator lists only self-check and weekly check-in reminders after an app restart on a device that had the old set.
