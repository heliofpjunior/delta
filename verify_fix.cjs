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

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testRegistration() {
    console.log('--- Testing Customer Auto-Registration Logic ---');

    // Test data
    const name = 'Cliente Teste Antigravity';
    const doc = '111.111.111-11'; // Formatted doc
    const email = 'teste@exemplo.com';
    const phone = '(11) 99999-9999';
    const customPrice = 150.00;

    try {
        // 1. Clean document (Logic from route.ts)
        const cleanDocNumber = doc.replace(/\D/g, '');
        console.log('Cleaned Doc:', cleanDocNumber);

        // 2. Fetch existing customer (Logic from route.ts)
        const { data: existingCustomer, error: fetchError } = await supabaseAdmin
            .from('customers')
            .select('id, total_spent')
            .eq('doc', cleanDocNumber)
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching customer:', fetchError.message);
        }

        const newSpent = (Number(existingCustomer?.total_spent) || 0) + customPrice;
        console.log('Estimated New Spent:', newSpent);

        // 3. Upsert Customer (Logic from route.ts)
        const customerPayload = {
            doc: cleanDocNumber,
            name: name,
            email: email,
            phone: phone,
            status: 'Ativo',
            origin: 'Próprio',
            total_spent: newSpent,
            last_contact: new Date().toISOString(),
            certificate_type: 'Teste Digital'
        };

        const { data: upsertData, error: upsertError } = await supabaseAdmin
            .from('customers')
            .upsert(customerPayload, { onConflict: 'doc' })
            .select();

        if (upsertError) {
            console.error('❌ CRM Upsert Failed:', upsertError.message);
            if (upsertError.code === '42710' || upsertError.message.includes('unique')) {
                console.log('Note: Unique constraint issue detected. Check if migration ran correctly.');
            }
        } else {
            console.log('✅ Success! Customer registered/updated:', upsertData[0].name);
            console.log('Current Total Spent:', upsertData[0].total_spent);
        }

    } catch (e) {
        console.error('Fatal Exception:', e.message);
    }
}

testRegistration();
