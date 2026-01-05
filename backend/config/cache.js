/**
 * Simple In-Memory Cache for Railway Efficiency
 *
 * Reduces database queries by caching frequently accessed data
 * Perfect for client configs that rarely change
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Get item from cache
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const expiry = this.ttls.get(key);

    // Check if expired
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  /**
   * Set item in cache with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + (ttlSeconds * 1000));
  }

  /**
   * Delete item from cache
   * @param {string} key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    const now = Date.now();
    const activeEntries = Array.from(this.ttls.entries())
      .filter(([, expiry]) => now < expiry)
      .length;

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: this.cache.size - activeEntries
    };
  }
}

// Export singleton
module.exports = new SimpleCache();
