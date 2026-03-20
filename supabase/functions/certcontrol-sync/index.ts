import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CERTCONTROL_API_URL = 'https://service.certcontrol.com.br';
const CERTCONTROL_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiYjE5MzFhZjdhMzY1NzI3YmMyYWIxYmVmMDVhMzVkYzM3MmY1Njk2NjY5MzU3OGRlYjEwZjg1OTE5MmNjNDhkZGQ2ZTE3MGNkMDNkODAzMjkiLCJpYXQiOjE3NzE3OTIyNjEuOTk1MjYzLCJuYmYiOjE3NzE3OTIyNjEuOTk1MjY1LCJleHAiOjE4MDMyNjUyMDAuMDA0MjUzLCJzdWIiOiI1NzYxIiwic2NvcGVzIjpbImludGVncmFjYW8iXX0.k-TPY21xekFRxvFU_vbXux_aBh5MRoFAuzdkigCyPJDHVh27J9DvvZqG_3Lnr3QhPvXAx4AmI9dk_DDxQtM_Uw6F0LEaqeUBsK5kTtnkuKodqnIfCG5vbKzvqztoAyn7yV0uLPS_Bk7UTSIxAKdHfwX0zrV1vA9qKppne3OsaifKvhTCfkEacJHPTC4zXhqN1IgyIczW6MNOy5U654NRYgOZzvr-Ajx7BS_8bLnVbn0cfQxnD5bKS_KGtmEgy4NR-tLZZPh2u3c4T2rhuK7KtZ7OUW54gYefwd77oQvGh-HRm_xAVsLPJ3XhvoWr_zf8av1nom7w_2YO9Ne_roSkZFSZrcOozeVXipNHPD91Zp52oBLmN6RPmAUN5iECXNEY8zUSMJKZ-e26o4IXBed1wPg8H1-tS64nd3w2v2yZLGQJLKTiXFsu6tfyxAmn7ZwGZ8YlTsRtG_PixEubTK2CI2flWsBuju8wBWNTMKYc7bI1UY0zJYAWlNfXfGdEj0s5qNT0DCLCr4c4OfWNjkx_1sMWXnFcPVIRjKohHS0agZU8LXJVsqVvsH5pO5jy2YorgmjXoV0jG_nPd29HL_4vugR91ABbF4bpU1suGPGCefuZUmE0x3UpAWh7TZ5RiExUclJLZE--NIEFRYvWv1E-_zjDzW2sjxwkAWDT2fEK6Qw';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse query params for mode
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode'); // 'hot' or 'full'

    // 2. Handle Health Check / Polling Trigger (GET)
    if (req.method === 'GET') {
        if (mode === 'hot' || mode === 'full') {
            console.log(`📡 Scheduled Sync Triggered: Mode=${mode}`);
            const stats = await runFullSync(supabaseClient, mode);
            return new Response(JSON.stringify({ success: true, mode, ...stats }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        console.log("🔍 Health Check / Verification GET received");
        return new Response(JSON.stringify({
            status: 'online',
            message: 'Delta360 Sync Endpoint Ready',
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    }

    try {
        const contentType = req.headers.get('content-type') || '';
        const payload = await req.json().catch(() => ({}));

        console.log(`📩 Request Received: Method=${req.method}, ContentType=${contentType}`);

        // A payload is a webhook if it has order identification fields
        const isWebhook = !!(payload.id || payload.pedido || payload.numero_pedido || payload.numero_protocolo);
        // Explicit manual trigger
        const isManualTrigger = payload.source === 'crm_manual_trigger';

        if (isManualTrigger) {
            console.log("🚀 Manual Sync Triggered from Dashboard");
            const stats = await runFullSync(supabaseClient, 'full');
            return new Response(JSON.stringify({ success: true, mode: 'manual', ...stats }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (isWebhook) {
            console.log("🟢 Webhook Payload Detected:", JSON.stringify(payload));
            await processSale(payload, supabaseClient, 'webhook');
            return new Response(JSON.stringify({ success: true, mode: 'webhook' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Generic fallback for unknown POSTs (log and return 200 to not block supplier)
        console.log("⚠️ Unknown POST payload received:", JSON.stringify(payload));
        return new Response(JSON.stringify({
            success: true,
            mode: 'unknown',
            message: 'Payload logged but no action taken.'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("🔴 Fatal Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

async function runFullSync(supabase, mode = 'full') {
    let updatedCustomersCount = 0;
    let updatedOrdersCount = 0;
    let currentPage = 1;
    let hasNextPage = true;
    const maxPages = mode === 'hot' ? 2 : 999;

    while (hasNextPage && currentPage <= maxPages) {
        console.log(`📡 Fetching page ${currentPage}...`);
        const res = await fetch(`${CERTCONTROL_API_URL}/api/integracao/vendas?page=${currentPage}`, {
            headers: { 'Authorization': `Bearer ${CERTCONTROL_TOKEN}` }
        });
        const data = await res.json();
        const sales = data.data;
        const meta = data.meta;

        if (!Array.isArray(sales)) {
            console.error("🔴 API response 'data' is not an array:", data);
            break;
        }

        console.log(`📦 Page ${currentPage} received ${sales.length} sales.`);

        for (const sale of sales) {
            const stats = await processSale(sale, supabase, mode === 'full' ? 'manual' : mode);
            if (stats.customerUpdated) updatedCustomersCount++;
            if (stats.orderUpdated) updatedOrdersCount++;
        }

        if (meta && meta.current_page < meta.last_page) {
            currentPage++;
        } else {
            hasNextPage = false;
        }
    }

    return { customersCount: updatedCustomersCount, ordersCount: updatedOrdersCount, pagesProcessed: currentPage - 1 };
}

async function processSale(sale, supabase, eventSource = 'manual') {
    const doc = sale.documento?.replace(/\D/g, '');
    const saleId = sale.id?.toString() || sale.pedido?.toString() || sale.numero_pedido?.toString();

    let certStatus = sale.status || 'Pendente';

    // Check Soluti Situation for better accuracy (emission status)
    const solutiSit = sale.soluti?.situação || '';
    if (solutiSit.includes('Emitida')) {
        certStatus = 'Emitido';
    } else if (solutiSit.includes('Validada')) {
        certStatus = 'Validado';
    } else if (solutiSit.includes('Agendada')) {
        certStatus = 'Agendado';
    } else if (solutiSit.includes('Reprovada')) {
        certStatus = 'Reprovado';
    }

    // Logic to force 'Emitido' if we have an expiry date, even if CertControl says 'Pago'
    if (certStatus === 'Pago' && sale.data_vencimento) {
        certStatus = 'Emitido';
    }

    // --- IDEMPOTENCY CHECK ---
    const filters = [];
    if (saleId) filters.push(`supplier_order_id.eq.${saleId}`);
    if (doc) filters.push(`and(doc.eq.${doc},status.eq.Pendente)`);
    if (saleId) filters.push(`protocol.ilike.%${saleId}%`);

    if (filters.length === 0) {
        return { customerUpdated: false, orderUpdated: false, skipped: true };
    }

    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status, supplier_status, technical_details, supplier_order_id')
        .or(filters.join(','))
        .limit(1)
        .maybeSingle();

    const expiryDate = sale.data_vencimento ? sale.data_vencimento.split(' ')[0] : null;

    // Skip if status is already the same AND no other critical changes (like expiry)
    if (existingOrder && existingOrder.supplier_status === certStatus) {
        // Optionally check for expiry date changes in technical_details or anywhere else stored
        // For now, if supplier_status is same, we assume no change unless it's a critical update
        return { customerUpdated: false, orderUpdated: false, skipped: true };
    }
    // ---------------------------

    let customerUpdated = false;
    let orderUpdated = false;

    if (doc) {
        const customerPayload: any = {
            expiry_date: expiryDate,
            certificate_type: typeof sale.produto === 'object' ? sale.produto.descrição : (sale.produto || 'Digital'),
            last_contact: new Date().toISOString()
        };

        if (sale.titular) {
            customerPayload.name = sale.titular;
        }

        if (customerPayload.expiry_date) {
            const expD = new Date(customerPayload.expiry_date);
            const now = new Date();
            customerPayload.status = expD < now ? 'Vencido' : 'Ativo';
        }

        const { error: cErr } = await supabase.from('customers').update(customerPayload).eq('doc', doc);
        if (!cErr) customerUpdated = true;
    }

    let deltaStatus = 'Pendente';
    const activeStatues = ['Pago', 'Aguardando Agendamento', 'Agendado', 'Em Validação', 'Validado', 'Aprovado', 'Emitido', 'Concluído'];

    if (certStatus === 'Emitido' || certStatus === 'Concluído') {
        deltaStatus = 'Emitido';
    } else if (certStatus === 'Aprovado' || certStatus === 'Validado') {
        deltaStatus = 'Aprovado';
    } else if (activeStatues.includes(certStatus)) {
        deltaStatus = 'Pago';
    } else if (['Cancelado', 'Estornado', 'Reembolsado', 'Expirado'].includes(certStatus)) {
        deltaStatus = 'Cancelado';
    }

    const protocol = sale.numero_pedido ? `PEDIDO - ${sale.numero_pedido}` : (sale.numero_protocolo || `PEDIDO - ${saleId}`);

    const { data: updated, error: oErr } = await supabase
        .from('orders')
        .update({
            status: deltaStatus,
            supplier_status: certStatus,
            supplier_order_id: saleId,
            protocol: protocol
        })
        .or(filters.join(','))
        .select();

    let finalOrder = updated?.[0];

    if (!oErr && updated && updated.length > 0) {
        orderUpdated = true;
    } else if (doc) {
        const { data: fallback } = await supabase
            .from('orders')
            .update({ status: deltaStatus, supplier_status: certStatus, supplier_order_id: saleId })
            .match({ doc: doc })
            .select();
        if (fallback && fallback.length > 0) {
            orderUpdated = true;
            finalOrder = fallback[0];
        }
    }

    // Record Log Entry
    if (orderUpdated && finalOrder) {
        await supabase.from('sync_logs').insert({
            order_id: finalOrder.id,
            external_id: saleId,
            event_type: eventSource,
            status_before: existingOrder?.supplier_status || 'N/A',
            status_after: certStatus,
            payload: sale,
            message: `Sync (${eventSource}): ${saleId}. Status: ${certStatus}`
        });
    }

    return { customerUpdated, orderUpdated };
}
