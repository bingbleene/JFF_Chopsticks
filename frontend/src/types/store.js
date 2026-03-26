
/**
 * @typedef {Object} AuthState
 * @property {string|null} accessToken
 * @property {import('./user').User|null} user
 * @property {boolean} loading
 * @property {function(string): void} setAccessToken
 * @property {function(): void} clearState
 * @property {function(string, string): Promise<void>} signIn
 * @property {function(): Promise<void>} signOut
 * @property {function(): Promise<void>} fetchMe
 * @property {function(): Promise<void>} refresh
 */