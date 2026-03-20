
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function debug() {
    try {
        console.log("🔍 Debugging orphans for user c57a39cd-a77e-42d5-8168-436a87761a3a...");
        const { data, error } = await supabase
            .from('financial_transactions')
            .select('id, type, status, amount, description, withdrawal_id')
            .eq('user_id', 'c57a39cd-a77e-42d5-8168-436a87761a3a');

        if (error) throw error;

        console.log(`\n📋 Total de transações found: ${data.length}`);

        const orphans = data.filter(t => t.withdrawal_id === null);
        console.log(`🧩 Órfãs (withdrawal_id IS NULL): ${orphans.length}`);

        orphans.forEach(o => {
            console.log(`- Type: ${o.type} | Status: ${o.status} | Amount: ${o.amount} | Desc: ${o.description}`);
        });

    } catch (e) {
        console.error(e);
    }
}
debug();
