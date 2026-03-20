import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbbjrrwgjxmdzgpnnryy.supabase.co';
const supabaseAnonKey = 'sb_publishable_7p7odlQAuB_pmeQdVYtLGQ_wRwuG2kU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('sync_logs').select('*').limit(1);
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Table sync_logs exists!');
    }
}

check();
