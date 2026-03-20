import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    const { data: customers, error } = await supabase.from('customers').select('doc').limit(5);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Customer docs:', customers);
    }
}

checkData();
