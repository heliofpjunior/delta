
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function simulateGet() {
    try {
        console.log("Simulating GET /api/admin/financials (list)...");
        const { data, error } = await supabase
            .from('financial_transactions')
            .select(`
                *,
                profiles (full_name, pix_key)
            `)
            .eq('type', 'Solicitação de Saque')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("🔴 List Error:", error);
            process.exit(1);
        } else {
            console.log("✅ List Success. Count:", data.length);
            if (data.length > 0) {
                const id = data[0].id;
                console.log(`\nSimulating GET for ID: ${id}...`);
                const { data: item, error: itemError } = await supabase
                    .from('financial_transactions')
                    .select(`
                        *,
                        profiles (*)
                    `)
                    .eq('id', id)
                    .single();

                if (itemError) {
                    console.error("🔴 Detail Error:", itemError);
                    process.exit(1);
                } else {
                    console.log("✅ Detail Success:", item.id);
                    console.log("Profile check:", item.profiles ? "FOUND" : "NOT FOUND");
                }
            }
        }
    } catch (e) {
        console.error("🔥 CATCH ERROR:", e);
        process.exit(1);
    }
}
simulateGet();
