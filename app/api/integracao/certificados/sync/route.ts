import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
    try {
        console.log("🚀 Triggering Supabase Edge Function Sync (Manual)...");

        if (!SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");
        }

        // Call the Edge Function with Service Role for full access
        const response = await fetch(`${SUPABASE_URL}/functions/v1/certcontrol-sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ source: 'crm_manual_trigger' })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error("🔴 Edge Function Error Status:", response.status);
            console.error("🔴 Edge Function Error Data:", JSON.stringify(data));
            throw new Error(data.error || `Edge Function returned ${response.status}`);
        }

        return NextResponse.json({
            success: true,
            message: `Sincronização concluída. Clientes: ${data.customersCount || 0}, Pedidos: ${data.ordersCount || 0}`,
            ...data
        });

    } catch (error: any) {
        console.error("🔴 Proxy Sync Error:", error.message);
        return NextResponse.json({
            error: "Erro na sincronização: " + error.message
        }, { status: 500 });
    }
}
