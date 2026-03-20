import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            // UUID Validation (Basic regex for UUID v4)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return NextResponse.json({ error: "ID de transação inválido" }, { status: 400 });
            }

            console.log("🔍 Fetching detailed withdrawal for ID:", id);

            // Simplified join syntax: using '*' for all columns and 'profiles(*)' for the relation
            const { data: withdrawal, error: wError } = await supabase
                .from('financial_transactions')
                .select(`
                    *,
                    profiles (*)
                `)
                .eq('id', id)
                .single();

            if (wError) {
                console.error("🔴 Withdrawal Fetch Error:", wError);
                throw wError;
            }

            // Fetch linked commissions
            const { data: commissions, error: cError } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('withdrawal_id', id);

            if (cError) {
                console.error("🔴 Commissions Fetch Error:", cError);
                throw cError;
            }

            return NextResponse.json({ ...withdrawal, commissions });
        }

        // Fetch all pending withdrawal requests for list
        const { data, error } = await supabase
            .from('financial_transactions')
            .select(`
                *,
                profiles (full_name, pix_key)
            `)
            .eq('type', 'Solicitação de Saque')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("🔴 List Fetch Error:", error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("🔥 Server Error in /api/admin/financials:", error);
        return NextResponse.json({
            error: error.message,
            details: error,
            hint: "Verifique se todas as migrações foram aplicadas e se as colunas existem."
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { transactionId, action, proofUrl, observations, approvedItems, refusedItems } = await request.json();

        if (!transactionId || !action) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // 1. Get the withdrawal transaction
        const { data: tx, error: txError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (txError || !tx) throw txError || new Error("Transação não encontrada");

        if (action === 'audit') {
            // Update individual items status
            if (approvedItems && approvedItems.length > 0) {
                await supabase.from('financial_transactions').update({ status: 'Aprovado' }).in('id', approvedItems);
            }
            if (refusedItems && refusedItems.length > 0) {
                await supabase.from('financial_transactions').update({ status: 'Recusado' }).in('id', refusedItems);
            }
            if (observations) {
                await supabase.from('financial_transactions').update({ observations }).eq('id', transactionId);
            }
            return NextResponse.json({ success: true });

        } else if (action === 'liquidate') {
            // 1. Fetch linked items to calculate approved/refused totals
            const { data: items } = await supabase
                .from('financial_transactions')
                .select('amount, status')
                .eq('withdrawal_id', transactionId);

            const totalApproved = items?.filter(i => i.status === 'Aprovado' || i.status === 'Liquidado').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            const totalRefused = items?.filter(i => i.status === 'Recusado').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
            const totalRequested = Math.abs(Number(tx.amount));

            // Liquidate: Change status to Liquidado
            const { error: updateTxError } = await supabase
                .from('financial_transactions')
                .update({
                    status: 'Liquidado',
                    proof_url: proofUrl,
                    observations: observations,
                    amount: -totalApproved, // Adjust total to match approved amount
                    description: `Saque liquidado (R$ ${totalApproved.toLocaleString('pt-BR')}). Estornado: R$ ${totalRefused.toLocaleString('pt-BR')}. Obs: ${observations || 'Sem observações'}`
                })
                .eq('id', transactionId);

            if (updateTxError) throw updateTxError;

            // Update linked items to Liquidado
            await supabase.from('financial_transactions').update({ status: 'Liquidado' }).eq('withdrawal_id', transactionId).eq('status', 'Aprovado');

            // Handle Balance Adjustment
            const { data: profile } = await supabase.from('profiles').select('balance_available, balance_processing').eq('id', tx.user_id).single();

            // Processing: Remove the ENTIRE requested amount that was held
            // Available: Return the REFUSED amount
            await supabase
                .from('profiles')
                .update({
                    balance_processing: (Number(profile?.balance_processing) || 0) - totalRequested,
                    balance_available: (Number(profile?.balance_available) || 0) + totalRefused
                })
                .eq('id', tx.user_id);

            // If there were refused items, create a reversal transaction for clarity in extract
            if (totalRefused > 0) {
                await supabase.from('financial_transactions').insert({
                    user_id: tx.user_id,
                    amount: totalRefused,
                    type: 'Estorno de Saque (Auditado)',
                    status: 'Disponível',
                    description: `Valor estornado do saque ${transactionId} devido a itens recusados na auditoria.`,
                    reference_type: 'withdrawal',
                    reference_id: transactionId
                });

                // Unlink refused items from this withdrawal so they can be requested again if corrected
                await supabase.from('financial_transactions').update({ withdrawal_id: null }).eq('withdrawal_id', transactionId).eq('status', 'Recusado');
            }

            return NextResponse.json({ success: true, message: `Saque liquidado: R$ ${totalApproved.toLocaleString('pt-BR')} pagos.` });

        } else if (action === 'refuse') {
            // Refuse entire withdrawal: Return money to available balance
            const { error: updateTxError } = await supabase
                .from('financial_transactions')
                .update({
                    status: 'Recusado',
                    observations: observations
                })
                .eq('id', transactionId);

            if (updateTxError) throw updateTxError;

            // Move balance back from processing to available
            const amountToReturn = Math.abs(Number(tx.amount));
            const { data: profile } = await supabase.from('profiles').select('balance_available, balance_processing').eq('id', tx.user_id).single();

            await supabase
                .from('profiles')
                .update({
                    balance_available: (Number(profile?.balance_available) || 0) + amountToReturn,
                    balance_processing: (Number(profile?.balance_processing) || 0) - amountToReturn
                })
                .eq('id', tx.user_id);

            // Also un-link commissions
            await supabase.from('financial_transactions').update({ withdrawal_id: null, status: 'Disponível' }).eq('withdrawal_id', transactionId);

            return NextResponse.json({ success: true, message: "Saque recusado e saldo retornado" });
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

    } catch (error: any) {
        console.error("Erro na ação administrativa:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
