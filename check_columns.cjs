
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function check() {
    try {
        console.log("Checking for withdrawal_id column...");
        const { data, error } = await supabase
            .from('financial_transactions')
            .select('withdrawal_id')
            .limit(1);

        if (error) {
            console.error("🔴 ERROR detected:", error.message);
        } else {
            console.log("✅ Column 'withdrawal_id' exists.");
        }
    } catch (e) {
        console.error("Fatal:", e);
    }
}
check();
