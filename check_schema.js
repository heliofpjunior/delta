import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('Checking internal schema info...');

    // Check for unique constraints on doc in customers
    const { data: constraints, error } = await supabase.rpc('get_table_constraints', { t_name: 'customers' });

    if (error) {
        console.log('RPC failed, trying raw query via information_schema...');
        const { data, error: queryError } = await supabase
            .from('information_schema.table_constraints')
            .select('*')
            .eq('table_name', 'customers');

        if (queryError) {
            console.log('❌ Error querying schema:', queryError.message);
        } else {
            console.log('Constraints:', data);
        }
    } else {
        console.log('Constraints:', constraints);
    }
}

// Since I might not have the RPC, let's try a simpler way: try to insert a duplicate and see if it fails
async function testDuplicate() {
    console.log('Testing duplicate doc insertion...');
    const testDoc = '00000000000';

    // First, try to delete if exists
    await supabase.from('customers').delete().eq('doc', testDoc);

    // Insert first
    const { error: err1 } = await supabase.from('customers').insert({ name: 'Test 1', doc: testDoc });
    if (err1) {
        console.log('❌ Error inserting first:', err1.message);
        return;
    }

    // Insert second
    const { error: err2 } = await supabase.from('customers').insert({ name: 'Test 2', doc: testDoc });
    if (err2) {
        if (err2.code === '23505') {
            console.log('✅ doc column IS UNIQUE (caught 23505)');
        } else {
            console.log('❌ Error inserting second:', err2.message);
        }
    } else {
        console.log('⚠️ doc column IS NOT UNIQUE (inserted duplicate successfully)');
        // Cleanup
        await supabase.from('customers').delete().eq('doc', testDoc);
    }
}

testDuplicate();
