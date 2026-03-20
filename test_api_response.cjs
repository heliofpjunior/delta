const axios = require('axios');
const fs = require('fs');

async function testApi() {
    const userId = 'c57a39cd-a77e-42d5-8168-436a87761a3a';
    console.log(`--- Testing Financial API for User: ${userId} ---`);

    try {
        // We'll simulate a fetch to the API. 
        // Since we can't easily hit the local running dev server from here reliably sometimes, 
        // we'll simulate the logic or use a local request if possible.
        // Actually, I'll just use the supabase client directly to simulate the API response.

        const { createClient } = require('@supabase/supabase-js');
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
        const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];
        const supabase = createClient(url, key);

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('balance_available, balance_processing')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error("Profile Error:", profileError);
        } else {
            console.log("API Simulation Result (Profile):", profile);
        }

        const { data: transactions, error: txError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (txError) {
            console.error("Transactions Error:", txError);
        } else {
            console.log("API Simulation Result (Transactions Count):", transactions.length);
            console.log("First Transaction:", transactions[0]);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

testApi();
