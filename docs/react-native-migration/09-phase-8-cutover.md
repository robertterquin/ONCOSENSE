# Phase 8 — Cutover: Merge into `main` & Retire Flutter

**Goal:** merge `react-native-migration` into `main` so React Native becomes the only app in the repo, with the Flutter code safely archived.
**Effort:** 2–3 days. **Branch:** `rn/phase-8-cutover` (from `react-native-migration`).

Only start this after Phase 7's internal testing and closed beta are signed off. The public store release (Phase 7.4 step 3) is built from `main` **after** this merge.

## Merge, don't override

The migration branch is merged into `main` with a normal pull request. Never force-push it over `main` or reset `main` to it:

- A force-push deletes `main`'s history from GitHub, including any Flutter fixes made during the migration (such as the GNews key fix).
- Anyone else's clone of the repo breaks.
- It isn't needed: step 8.2 deletes the Flutter files anyway, so a merge gives the same final result **and** keeps all history.

## 8.1 Archive Flutter

- [ ] On `main`, tag the last Flutter commit:
  ```bash
  git checkout main && git pull && git tag flutter-final && git push origin flutter-final
  ```
- [ ] Optionally create a long-lived branch `archive/flutter` from that tag for easy browsing on GitHub.

## 8.2 Remove Flutter (on the migration branch)

- [ ] Bring in the last `main` changes first: `git checkout react-native-migration && git merge origin/main`.
- [ ] On `rn/phase-8-cutover`, delete: `lib/`, `test/`, `android/`, `ios/`, `web/`, `linux/`, `macos/`, `windows/`, `pubspec.yaml`, `pubspec.lock`, `analysis_options.yaml`, `devtools_options.yaml`, `.metadata`, `.flutter-plugins-dependencies`, `build/`, `.dart_tool/`.
- [ ] Move Flutter-only docs to `docs/archive/flutter/`: `RIVERPOD_MIGRATION_GUIDE.md`, `RIVERPOD_QUICK_REFERENCE.md`, `IMPLEMENTATION_SUMMARY.md`, `JOURNEY_SETUP_GUIDE.md`.
- [ ] Keep at the root (still valid for Supabase): `BOOKMARK_TABLES_SETUP.sql`, `JOURNEY_TABLES_SETUP.sql`, `CANCER_DATA_SETUP.md` — or move them into `supabase/`.
- [ ] Remove Flutter entries from `.gitignore`.
- [ ] Update `.github/copilot-instructions.md` for the React Native codebase.

## 8.3 Decide the final layout

Pick one and record it in the decision log:

- **Keep `mobile/`** (simplest; leaves room for `supabase/` and a future `web/` side by side), or
- **Move `mobile/` to the repo root** with `git mv` so history is preserved. Update CI paths and EAS config afterwards.

- [ ] Rewrite the root `README.md` for the React Native app: setup, env vars, running, building, releasing.
- [ ] Merge `rn/phase-8-cutover` into `react-native-migration`.

## 8.4 Final merge into `main`

- [ ] Open a PR from `react-native-migration` into `main` titled "Migrate OncoSense to React Native".
- [ ] Check the diff: only Flutter deletions, `mobile/`, `docs/`, CI and config files. Nothing unexpected.
- [ ] CI is green and at least one person approves.
- [ ] Merge with **"Create a merge commit"** (not squash), so every phase's commits stay in history.
- [ ] Build the production release from `main` and continue with Phase 7.4 step 3 (store release).
- [ ] Delete the `react-native-migration` branch once the release is out. `rn/*` branches can be deleted too.

## 8.5 After release

- [ ] Remove now-unneeded Flutter-era database objects **only if** no installed Flutter app still uses them. Wait until store analytics show old versions are near zero.
- [ ] Mark every phase **Done** in the [README](README.md) status table.

## Rollback

If the React Native release has a serious problem: halt the store rollout, then rebuild and resubmit the Flutter app from `git checkout flutter-final` with a higher version number while the issue is fixed.

## Done when

- [ ] `main` contains no Flutter code; `git checkout flutter-final` restores it.
- [ ] `main`'s history still contains all Flutter commits and all migration commits.
- [ ] A fresh clone can set up and run the app by following the root README alone.
