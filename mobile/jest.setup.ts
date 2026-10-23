// expo-sqlite's localStorage needs the native SQLite module, which Jest doesn't have.
jest.mock('expo-sqlite/localStorage/install', () => ({}));

// Node's own `localStorage` is unusable without `--localstorage-file`, so persisted
// stores get an in-memory one in tests.
const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, String(value)),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  },
});
