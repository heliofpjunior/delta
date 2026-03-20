const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(url, key);

async function verify() {
    console.log("--- Checking Order #554793 ---");
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('protocol, seller_id, seller_commission, status')
        .eq('protocol', 'PEDIDO - 554793')
        .single();

    if (orderError) {
        console.error("Order error:", orderError);
        return;
    }
    console.log("Order found:", order);

    console.log("\n--- Checking Profile for seller_id ---");
    // Since RLS is enabled, this will likely return null/empty if not logged in.
    // But we can check if the foreign key relationship is valid by trying to fetch related data if possible.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, balance_available, balance_processing')
        .eq('id', order.seller_id)
        .single();

    if (profileError) {
        console.warn("Profile not found or RLS blocked access:", profileError.message);
    } else {
        console.log("Profile found:", profile);
    }

    console.log("\n--- Checking Transactions for this order ---");
    const { data: txs, error: txError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('reference_id', '9f71dc46-4776-41fc-a122-5b9e8d75e5bb');

    if (txError) {
        console.error("Transaction error:", txError);
    } else {
        console.log("Transactions found:", txs);
    }
}

verify();
