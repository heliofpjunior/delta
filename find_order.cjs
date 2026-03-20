const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

if (!url || !key) {
    console.error("Supabase URL or Key not found in .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

async function findOrder() {
    const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .eq('protocol', 'PEDIDO - 554793');

    if (error) {
        console.error("Error fetching order:", error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

findOrder();
