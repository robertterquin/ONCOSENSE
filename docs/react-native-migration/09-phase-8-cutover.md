# Phase 8 — Cutover & Flutter Retirement

**Goal:** make React Native the only app in the repo, with the Flutter code safely archived.
**Effort:** 2–3 days. **Branch:** `rn/phase-8` (from `main`).

Because every phase has already been merged into `main` (see [Branching](README.md#branching)), there is no big final merge. This phase is one ordinary branch that removes the Flutter app.

Only start this after Phase 7 is done and the React Native release has been stable at 100% rollout for at least two weeks.

> **Done early (2026-10-23):** Robert chose to cut over before the React Native release. Until it ships, any Flutter fix is built from `archive/flutter`. See the decision log.

## 8.1 Archive Flutter

- [x] On `main`, tag the last commit that still contains the Flutter app (`flutter-final` → `c01d367`):
  ```bash
  git checkout main && git pull && git tag flutter-final && git push origin flutter-final
  ```
- [x] Optionally create a long-lived branch `archive/flutter` from that tag for easy browsing on GitHub. (Pushed.)

## 8.2 Remove Flutter

On `rn/phase-8`:

- [x] Delete: `lib/`, `test/`, `android/`, `ios/`, `web/`, `linux/`, `macos/`, `windows/`, `pubspec.yaml`, `pubspec.lock`, `analysis_options.yaml`, `devtools_options.yaml`, `.metadata`, `.flutter-plugins-dependencies`, `build/`, `.dart_tool/`. Also the Flutter `assets/` and root `.env.example`.
- [x] Move Flutter-only docs to `docs/archive/flutter/`: `RIVERPOD_MIGRATION_GUIDE.md`, `RIVERPOD_QUICK_REFERENCE.md`, `IMPLEMENTATION_SUMMARY.md`, `JOURNEY_SETUP_GUIDE.md`.
- [x] Keep at the root (still valid for Supabase): `BOOKMARK_TABLES_SETUP.sql`, `JOURNEY_TABLES_SETUP.sql`, `CANCER_DATA_SETUP.md` — or move them into `supabase/`.
- [x] Remove Flutter entries from `.gitignore`.
- [x] Bring the `news` Edge Function, `supabase/config.toml` and `supabase/.gitignore` over from `fix/gnews-key` (the app calls `news`); that branch's Flutter change is no longer needed.
- [x] Update `.github/copilot-instructions.md` for the React Native codebase.

## 8.3 Decide the final layout

Pick one and record it in the decision log:

- **Keep `mobile/`** (simplest; leaves room for `supabase/` and a future `web/` side by side), or
- **Move `mobile/` to the repo root** with `git mv` so history is preserved. Update CI paths and EAS config afterwards.

**Chosen: keep `mobile/`.**

- [x] Rewrite the root `README.md` for the React Native app: setup, env vars, running, building, releasing.

## 8.4 Merge

- [x] Check the diff: only Flutter deletions, moved docs, README and config changes. Nothing unexpected.
- [x] `mobile/` checks pass.
- [x] Merge into `main` with a merge commit (never force-push), then delete `rn/phase-8-cutover`. *(Merged as `95f1914`.)*

## 8.5 After release

- [ ] Remove now-unneeded Flutter-era database objects **only if** no installed Flutter app still uses them. Wait until store analytics show old versions are near zero.
- [ ] Mark every phase **Done** in the [README](README.md) status table.

## Rollback

If the React Native release has a serious problem: halt the store rollout, then rebuild and resubmit the Flutter app from `git checkout flutter-final` with a higher version number while the issue is fixed.

## Done when

- [x] `main` contains no Flutter code; `git checkout flutter-final` restores it.
- [x] `main`'s history still contains all Flutter commits and all migration commits.
- [x] A fresh clone can set up and run the app by following the root README alone (checked: fresh clone → `npm ci`, typecheck, 76 tests).
