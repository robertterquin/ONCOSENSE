# OncoSense — React Native app

The React Native (Expo) rewrite of OncoSense. The migration plan and progress live in [`docs/react-native-migration/`](../docs/react-native-migration/README.md).

## Setup

1. Install Node.js LTS.
2. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the Supabase URL and anon key (the same values as `SUPABASE_URL` / `SUPABASE_ANON_KEY` in the Flutter app's root `.env`).

## Run

| Command | What it does |
|---|---|
| `npm start` | Start the dev server (open in a development build) |
| `npm run ios` / `npm run android` | Build and run a development build locally (needs Xcode / Android Studio) |
| `npm run web` | Run in the browser |

## Check

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Jest unit tests |
| `npm run format` | Prettier |
| `npx expo-doctor` | Check dependency and config issues |

Add native packages with `npx expo install <package>` so versions match the Expo SDK.
