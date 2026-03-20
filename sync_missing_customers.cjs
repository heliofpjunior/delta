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
    console.error('Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function syncMissingCustomers() {
    console.log('--- Iniciando Sincronização de Clientes Faltantes ---');

    try {
        // 1. Buscar todas as ordens (exceto rascunhos se preferir, mas vamos pegar todas)
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        console.log(`Total de ordens encontradas: ${orders.length}`);

        // 2. Agrupar dados por documento limpo
        const customerMap = new Map();

        for (const order of orders) {
            if (!order.doc) continue;

            const cleanDoc = order.doc.replace(/\D/g, '');
            if (!cleanDoc) continue;

            if (!customerMap.has(cleanDoc)) {
                // Como as ordens estão ordenadas por data desc, a primeira que encontrarmos é a mais recente
                customerMap.set(cleanDoc, {
                    doc: cleanDoc,
                    name: order.holder_name,
                    email: order.billing_details?.billingEmail || order.billing_details?.email,
                    phone: order.billing_details?.billingPhone || order.billing_details?.phone,
                    status: 'Ativo',
                    origin: 'Próprio',
                    seller_id: order.seller_id,
                    total_spent: 0,
                    last_contact: order.created_at,
                    address: order.address_details || {},
                    certificate_type: order.technical_details?.mediaType || 'Digital'
                });
            }

            // Somar o total gasto de todas as ordens deste documento
            const cust = customerMap.get(cleanDoc);
            cust.total_spent += Number(order.final_price || 0);
        }

        console.log(`Documentos únicos encontrados nas ordens: ${customerMap.size}`);

        // 3. Preparar o Upsert
        const payloads = Array.from(customerMap.values()).map(c => ({
            doc: c.doc,
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            status: c.status,
            origin: c.origin,
            seller_id: c.seller_id,
            total_spent: c.total_spent,
            last_contact: c.last_contact,
            certificate_type: c.certificate_type,
            address_zip: c.address.cep || null,
            address_street: c.address.street || null,
            address_number: c.address.number || null,
            address_neighborhood: c.address.neighborhood || null,
            address_city: c.address.city || null,
            address_state: c.address.state || null,
            address_complement: c.address.complement || null
        }));

        console.log(`Enviando ${payloads.length} clientes para upsert...`);

        // 4. Executar Upsert (em batches se necessário, mas para volumes pequenos vai direto)
        const { error: upsertError } = await supabaseAdmin
            .from('customers')
            .upsert(payloads, { onConflict: 'doc' });

        if (upsertError) {
            console.error('❌ Erro no Upsert:', upsertError.message);
            if (upsertError.message.includes('unique')) {
                console.log('\n--- ATENÇÃO ---');
                console.log('O erro indica que você ainda NÃO aplicou a restrição de unicidade no banco.');
                console.log('Por favor, rode o script SQL que te enviei antes no painel do Supabase.');
                console.log('----------------\n');
            }
        } else {
            console.log('✅ Sincronização concluída com sucesso!');
        }

    } catch (e) {
        console.error('Erro Fatal:', e.message);
    }
}

syncMissingCustomers();
