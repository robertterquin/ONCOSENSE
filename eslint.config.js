// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // supabase/ holds the Deno Edge Function, checked by the Supabase CLI; showreel/ is the Remotion video with its own lint.
    ignores: ['dist/*', 'supabase/*', 'showreel/*'],
  },
]);
