const cache = require('../config/cache');

/**
 * Clear Cache Utility
 *
 * Usage:
 *   Clear specific client:  node scripts/clearCache.js <client_token>
 *   Clear all cache:        node scripts/clearCache.js --all
 *   Show cache stats:       node scripts/clearCache.js --stats
 */

async function clearCache() {
  const [,, arg] = process.argv;

  if (!arg) {
    console.log('❌ Usage:');
    console.log('  node scripts/clearCache.js <client_token>  - Clear specific client cache');
    console.log('  node scripts/clearCache.js --all           - Clear all cache');
    console.log('  node scripts/clearCache.js --stats         - Show cache statistics');
    process.exit(1);
  }

  try {
    if (arg === '--all') {
      // Clear all cache
      cache.clear();
      console.log('✅ All cache cleared!');
      console.log('💡 All widgets will fetch fresh config on next load.');
    }
    else if (arg === '--stats') {
      // Show cache stats
      const stats = cache.stats();
      console.log('\n📊 Cache Statistics:');
      console.log(`   Total entries: ${stats.total}`);
      console.log(`   Active entries: ${stats.active}`);
      console.log(`   Expired entries: ${stats.expired}`);
      console.log('');
    }
    else {
      // Clear specific client token
      const clientToken = arg;
      const cacheKey = `widget_config:${clientToken}`;

      const existed = cache.get(cacheKey) !== null;
      cache.delete(cacheKey);

      if (existed) {
        console.log(`✅ Cache cleared for client: ${clientToken}`);
        console.log('💡 Widget will fetch fresh config on next load.');
      } else {
        console.log(`ℹ️  No cache found for client: ${clientToken}`);
        console.log('   (Either not cached yet or already expired)');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

clearCache();
