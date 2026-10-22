// expo-sqlite's localStorage needs the native SQLite module, which Jest doesn't have.
// Persisted stores fall back to in-memory state in tests.
jest.mock('expo-sqlite/localStorage/install', () => ({}));
