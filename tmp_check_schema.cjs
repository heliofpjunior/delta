
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function check() {
    try {
        const { data, error } = await supabase.from('financial_transactions').select('*').limit(1);
        if (error) throw error;
        if (data && data.length > 0) {
            console.log("Keys:", Object.keys(data[0]));
        } else {
            console.log("Empty table.");
        }
    } catch (e) {
        console.error(e);
    }
}
check();
