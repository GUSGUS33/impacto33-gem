import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Principal',
  address_type TEXT NOT NULL DEFAULT 'both' CHECK (address_type IN ('billing', 'shipping', 'both')),
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  customer_type TEXT NOT NULL DEFAULT 'particular' CHECK (customer_type IN ('particular', 'empresa')),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company_name TEXT,
  cif TEXT,
  address TEXT NOT NULL DEFAULT '',
  address_line_2 TEXT,
  postal_code TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'España',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default_billing ON user_addresses(supabase_user_id, is_default_billing) WHERE is_default_billing = true;
CREATE INDEX IF NOT EXISTS idx_user_addresses_default_shipping ON user_addresses(supabase_user_id, is_default_shipping) WHERE is_default_shipping = true;

-- RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = supabase_user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses" ON user_addresses
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses" ON user_addresses
  FOR UPDATE USING (auth.uid() = supabase_user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses" ON user_addresses
  FOR DELETE USING (auth.uid() = supabase_user_id);
`;

async function main() {
  console.log('Creating user_addresses table...');
  
  const { error } = await supabase.rpc('exec_sql', { sql: CREATE_TABLE_SQL });
  
  if (error) {
    // Si rpc no funciona, intentar con REST API directa
    console.log('RPC not available, trying direct approach...');
    console.log('SQL to execute manually in Supabase dashboard:');
    console.log(CREATE_TABLE_SQL);
    console.log('\nPlease execute this SQL in the Supabase SQL Editor.');
  } else {
    console.log('Table created successfully!');
  }
}

main().catch(console.error);
