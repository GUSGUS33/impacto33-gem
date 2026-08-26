import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const tables = [
  'carts', 'cart_items', 'orders', 'order_items', 'payment_events',
  'wishlist_impacto33', 'user_personalization', 'user_addresses',
  'search_history', 'viewed_products', 'site_users'
];

// Use RPC to query information_schema
const { data, error } = await supabase.rpc('get_table_columns', {});
if (error) {
  console.log('RPC not available, trying direct approach...');
  
  // Try inserting empty objects and reading the error messages
  for (const table of tables) {
    console.log(`\n=== ${table} ===`);
    const { data: d, error: e } = await supabase.from(table).insert({}).select();
    if (e) {
      console.log(`  Insert error: ${e.message}`);
      console.log(`  Code: ${e.code}`);
      console.log(`  Details: ${e.details}`);
    } else {
      console.log(`  Columns: ${Object.keys(d[0]).join(', ')}`);
    }
  }
} else {
  console.log(JSON.stringify(data, null, 2));
}
