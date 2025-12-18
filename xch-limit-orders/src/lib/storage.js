/**
 * Cross-browser storage abstraction
 * Works with both Chrome (chrome.*) and Firefox (browser.*) APIs
 */

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

export const Storage = {
  /**
   * Get a value from local storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {Promise<*>}
   */
  async get(key, defaultValue = null) {
    try {
      const result = await browserAPI.storage.local.get(key);
      return result[key] ?? defaultValue;
    } catch (e) {
      console.error('[Storage] Error getting value:', e);
      return defaultValue;
    }
  },

  /**
   * Set a value in local storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      await browserAPI.storage.local.set({ [key]: value });
    } catch (e) {
      console.error('[Storage] Error setting value:', e);
    }
  },

  /**
   * Remove a key from local storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      await browserAPI.storage.local.remove(key);
    } catch (e) {
      console.error('[Storage] Error removing value:', e);
    }
  },

  /**
   * Get a value from session storage (survives page refresh, cleared on browser close)
   * Falls back to local storage with prefix for Firefox
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {Promise<*>}
   */
  async getSession(key, defaultValue = null) {
    try {
      // Chrome 102+ has storage.session
      if (browserAPI.storage.session) {
        const result = await browserAPI.storage.session.get(key);
        return result[key] ?? defaultValue;
      }
      // Fallback for Firefox (no session storage in extensions)
      return this.get(`_session_${key}`, defaultValue);
    } catch (e) {
      console.error('[Storage] Error getting session value:', e);
      return defaultValue;
    }
  },

  /**
   * Set a value in session storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<void>}
   */
  async setSession(key, value) {
    try {
      if (browserAPI.storage.session) {
        await browserAPI.storage.session.set({ [key]: value });
      } else {
        await this.set(`_session_${key}`, value);
      }
    } catch (e) {
      console.error('[Storage] Error setting session value:', e);
    }
  },

  /**
   * Remove a key from session storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async removeSession(key) {
    try {
      if (browserAPI.storage.session) {
        await browserAPI.storage.session.remove(key);
      } else {
        await this.remove(`_session_${key}`);
      }
    } catch (e) {
      console.error('[Storage] Error removing session value:', e);
    }
  },

  /**
   * Clear all session keys (for Firefox fallback)
   * @returns {Promise<void>}
   */
  async clearSession() {
    try {
      if (browserAPI.storage.session) {
        await browserAPI.storage.session.clear();
      } else {
        // Clear all keys with _session_ prefix
        const all = await browserAPI.storage.local.get(null);
        const sessionKeys = Object.keys(all).filter(k => k.startsWith('_session_'));
        if (sessionKeys.length > 0) {
          await browserAPI.storage.local.remove(sessionKeys);
        }
      }
    } catch (e) {
      console.error('[Storage] Error clearing session:', e);
    }
  }
};

export default Storage;
