const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: tables, error } = await supabase
        .from('supplier_tables')
        .select('*')
        .ilike('name', '%HELIO%');
    
    if (error) {
        console.error(error);
        return;
    }
    
    console.log("Found Tables:", JSON.stringify(tables, null, 2));

    const { data: prods, error: pError } = await supabase
        .from('products')
        .select('name, id, supplier_products(*, supplier_tables(*))')
        .limit(5);
        
    if (pError) console.error(pError);
    else console.log("Product Links Sample:", JSON.stringify(prods, null, 2));
}
check();
