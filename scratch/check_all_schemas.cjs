const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: cols, error } = await supabase.from('supplier_tables').select('*').limit(1);
    if (error) console.error(error);
    else console.log("Supplier Tables Columns:", Object.keys(cols[0]));

    const { data: prodData, error: prodError } = await supabase.from('products').select('*').limit(1);
    if (prodError) console.error(prodError);
    else console.log("Products Columns:", Object.keys(prodData[0]));
}
check();
