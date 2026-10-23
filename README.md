# OncoSense

A cancer awareness and support app: cancer information, prevention tips and self-check guides, a Q&A forum, support resources, a personal journey tracker, and health reminders.

Built with **React Native (Expo)** and **Supabase**. The original Flutter app was retired in October 2026; see [Flutter archive](#flutter-archive).

## Repository layout

| Path | What's there |
|---|---|
| `mobile/` | The app (Expo, TypeScript, Expo Router). Its own [README](mobile/README.md) has every command. |
| `supabase/` | Edge Functions (`news`, `delete-account`) and the Supabase CLI config |
| `*_SETUP.sql`, `CANCER_DATA_SETUP.md` | SQL and notes for the Supabase tables |
| `docs/react-native-migration/` | How the app was migrated from Flutter, phase by phase, with the decision log |
| `docs/archive/flutter/` | Notes from the Flutter era, kept for reference |
| `.github/workflows/mobile.yml` | CI: lint, typecheck and tests on every pull request and push to `main` |

## Get started

1. Install Node.js LTS.
2. Install and configure the app:
   ```bash
   cd mobile
   npm install
   cp .env.example .env
   ```
3. Fill in `mobile/.env` with the Supabase project URL and **anon** key (Supabase dashboard → Project Settings → API).
4. Run it:
   ```bash
   npm run web
   ```
   For iOS or Android, build a development build with `npm run ios` / `npm run android` (needs Xcode / Android Studio), or with EAS.

`mobile/README.md` covers checks, end-to-end tests and release builds.

## Supabase

The app uses the existing Supabase project (auth, Postgres with Row Level Security, the `images` storage bucket). Two Edge Functions live in `supabase/functions/` and need to be deployed with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-ref>
supabase secrets set GNEWS_API_KEY=<key>
supabase functions deploy news
supabase functions deploy delete-account
```

- `news` calls the GNews API server-side so the API key never ships in the app.
- `delete-account` deletes the signed-in user's data and account (required by the app stores).

## Releasing

Builds and store submissions go through EAS; see [Release builds](mobile/README.md#release-builds-eas). The release checklist is [Phase 7](docs/react-native-migration/08-phase-7-qa-release.md).

## Flutter archive

The Flutter app is preserved and can be restored or rebuilt at any time:

```bash
git checkout flutter-final      # tag: last commit with the Flutter app
git checkout archive/flutter    # branch for browsing or emergency fixes
```

## License

See [LICENSE](LICENSE).
