# OncoSense

A cancer awareness and support app: cancer information, prevention tips and self-check guides, a Q&A forum, support resources, a personal journey tracker, and health reminders.

Built with **React Native (Expo)** and **Supabase**. The original Flutter app was retired in October 2026; see [Flutter archive](#flutter-archive).

## Repository layout

| Path | What's there |
|---|---|
| `mobile/` | The app (Expo, TypeScript, Expo Router). Its own [README](mobile/README.md) has every command. |
| `supabase/` | Database migrations, the `delete-account` Edge Function and the Supabase CLI config |
| `supabase/reference/` | The original setup SQL and notes for the bookmark, journey and cancer-type tables (the rest of the schema lives only in the Supabase project) |
| `docs/redesign/` | The approved redesign and narrowed scope, phase by phase |
| `docs/react-native-migration/` | How the app was migrated from Flutter, phase by phase, with the decision log |
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

The app uses the existing Supabase project (auth, Postgres with Row Level Security, the `images` storage bucket). One Edge Function lives in `supabase/functions/` and needs to be deployed with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <project-ref>
supabase functions deploy delete-account
```

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
