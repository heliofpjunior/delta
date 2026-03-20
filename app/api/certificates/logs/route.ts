import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ error: "OrderId é obrigatório" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('sync_logs')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error("Erro ao buscar logs do pedido:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
