import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "UserId é obrigatório" }, { status: 400 });
    }

    try {
        // 1. Fetch Profile Balances
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('balance_available, balance_processing')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        // 2. Fetch Transactions
        const { data: transactions, error: txError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (txError) throw txError;

        // 3. Calculate "Total Sacado" from Liquidado transactions
        const { data: withdrawnData, error: withdrawError } = await supabase
            .from('financial_transactions')
            .select('amount')
            .eq('user_id', userId)
            .eq('status', 'Liquidado')
            .eq('type', 'Solicitação de Saque');

        if (withdrawError) throw withdrawError;

        const totalWithdrawn = Math.abs(withdrawnData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0);

        return NextResponse.json({
            available: profile.balance_available || 0,
            processing: profile.balance_processing || 0,
            withdrawn: totalWithdrawn,
            transactions: transactions || []
        });

    } catch (error: any) {
        console.error("Erro ao buscar dados financeiros:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, amount, pixKey } = await request.json();

        if (!userId || !amount || !pixKey) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // 1. Check current available balance via RPC or selection
        // We will call the new RPC 'process_full_withdrawal'
        const { data: result, error: rpcError } = await supabase.rpc('process_full_withdrawal', {
            p_user_id: userId,
            p_pix_key: pixKey
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            // Fallback to manual if RPC fails (e.g. not applied yet)
            return NextResponse.json({ error: "Erro ao processar saque. Verifique se a migração foi aplicada." }, { status: 500 });
        }

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Solicitação de saque total enviada com sucesso",
            withdrawalId: result.withdrawal_id,
            amount: result.amount
        });

    } catch (error: any) {
        console.error("Erro ao solicitar saque:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
