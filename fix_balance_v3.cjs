const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixBalanceV3() {
    console.log("--- SYNCING BALANCE V3 ---");
    const sellerId = 'c57a39cd-a77e-42d5-8168-436a87761a3a';

    // 1. Calculate using the new rule: Sum of all transactions (that are not Estornado/Recusado)
    const { data: txs, error: txError } = await supabase
        .from('financial_transactions')
        .select('amount, type, status')
        .eq('user_id', sellerId)
        .in('status', ['Disponível', 'Processando', 'Liquidado']);

    if (txError) {
        console.error("Error fetching transactions:", txError);
        return;
    }

    const availableBalance = txs.reduce((acc, tx) => acc + Number(tx.amount), 0);

    // Calculate processing (absolute sum of negative withdrawals in 'Processando')
    const processingBalance = txs
        .filter(tx => tx.type === 'Solicitação de Saque' && tx.status === 'Processando')
        .reduce((acc, tx) => acc + Math.abs(Number(tx.amount)), 0);

    console.log(`Calculated Available: R$ ${availableBalance.toFixed(2)}`);
    console.log(`Calculated Processing: R$ ${processingBalance.toFixed(2)}`);

    // 2. Update Profile
    const { error: profError } = await supabase
        .from('profiles')
        .update({
            balance_available: availableBalance,
            balance_processing: processingBalance
        })
        .eq('id', sellerId);

    if (profError) console.error("Error updating profile:", profError);
    else console.log("Profile balance synchronized successfully.");
}

fixBalanceV3();
