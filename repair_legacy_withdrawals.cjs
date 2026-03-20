
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function repair() {
    try {
        console.log("🔍 Iniciando reparo de saques legados (v2)...");

        // 1. Encontrar todos os pedidos de saque "Processando"
        const { data: withdrawals, error: wError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('type', 'Solicitação de Saque')
            .eq('status', 'Processando');

        if (wError) throw wError;
        if (!withdrawals || withdrawals.length === 0) {
            console.log("✅ Nenhum saque pendente encontrado para reparo.");
            return;
        }

        console.log(`📂 Encontrados ${withdrawals.length} saques pendentes.`);

        for (const w of withdrawals) {
            console.log(`\n⚙️ Reparando saque ${w.id} do usuário ${w.user_id}...`);

            // 2. Encontrar todas as comissões ou repasses do mesmo usuário que não têm withdrawal_id
            const { data: orphans, error: oError } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('user_id', w.user_id)
                .is('withdrawal_id', null)
                .in('type', ['Crédito de Comissão', 'Repasse/Venda'])
                .in('status', ['Processando', 'Disponível', 'Aprovado']);

            if (oError) {
                console.error(`❌ Erro ao buscar órfãs para ${w.user_id}:`, oError.message);
                continue;
            }

            if (!orphans || orphans.length === 0) {
                console.log(`⚠️ Nenhuma comissão ou repasse órfão encontrado para este usuário.`);
                continue;
            }

            console.log(`🔗 Vinculando ${orphans.length} itens ao saque ${w.id}...`);

            // 3. Vincular os itens
            const orphanIds = orphans.map(o => o.id);
            const { error: uError } = await supabase
                .from('financial_transactions')
                .update({ withdrawal_id: w.id, status: 'Processando' })
                .in('id', orphanIds);

            if (uError) {
                console.error(`❌ Erro ao vincular itens:`, uError.message);
            } else {
                console.log(`✅ Sucesso! Saque ${w.id} agora tem itens vinculados.`);
            }
        }

        console.log("\n🚀 Reparo concluído!");

    } catch (e) {
        console.error("🔥 Erro fatal no reparo:", e);
    }
}

repair();
