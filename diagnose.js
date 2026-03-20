
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    const url = 'https://vbbjrrwgjxmdzgpnnryy.supabase.co';
    const key = 'sb_publishable_7p7odlQAuB_pmeQdVYtLGQ_wRwuG2kU';
    const supabase = createClient(url, key);

    console.log('Searching for doc: 02647988994');

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or('doc.eq.02647988994,doc.ilike.%026.479.889-94%,doc.ilike.%02647988994%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Results:', JSON.stringify(data, null, 2));

    if (data.length === 0) {
        console.log('No direct match. Listing first 5 customers:');
        const { data: list } = await supabase.from('customers').select('doc, name').limit(5);
        console.log('Sample docs:', JSON.stringify(list, null, 2));
    }
}

check();
