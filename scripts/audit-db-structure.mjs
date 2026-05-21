import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tables = [
  'carts', 'cart_items', 'orders', 'order_items', 'payment_events',
  'wishlist_impacto33', 'user_personalization', 'user_addresses',
  'search_history', 'viewed_products', 'site_users', 'sites'
];

for (const table of tables) {
  console.log(`\n=== ${table} ===`);
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) {
    console.log(`  ERROR: ${error.message}`);
  } else if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    console.log(`  Columns: ${cols.join(', ')}`);
    const hasSiteId = cols.includes('site_id');
    console.log(`  Has site_id: ${hasSiteId}`);
  } else {
    console.log('  (empty table - trying to get columns via empty result)');
    // Try inserting a bad row to see the error with column names
    const { data: d2, error: e2 } = await supabase.from(table).select('*').limit(0);
    console.log(`  Result: ${JSON.stringify(d2)}`);
  }
}
