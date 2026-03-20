module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://vbbjrrwgjxmdzgpnnryy.supabase.co") || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY não encontrada. Operações administrativas podem falhar.");
}
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceKey);
}),
"[project]/app/api/admin/financials/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        if (id) {
            // UUID Validation (Basic regex for UUID v4)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "ID de transação inválido"
                }, {
                    status: 400
                });
            }
            console.log("🔍 Fetching detailed withdrawal for ID:", id);
            // Simplified join syntax: using '*' for all columns and 'profiles(*)' for the relation
            const { data: withdrawal, error: wError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').select(`
                    *,
                    profiles (*)
                `).eq('id', id).single();
            if (wError) {
                console.error("🔴 Withdrawal Fetch Error:", wError);
                throw wError;
            }
            // Fetch linked commissions
            const { data: commissions, error: cError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').select('*').eq('withdrawal_id', id);
            if (cError) {
                console.error("🔴 Commissions Fetch Error:", cError);
                throw cError;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ...withdrawal,
                commissions
            });
        }
        // Fetch all pending withdrawal requests for list
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').select(`
                *,
                profiles (full_name, pix_key)
            `).eq('type', 'Solicitação de Saque').order('created_at', {
            ascending: true
        });
        if (error) {
            console.error("🔴 List Fetch Error:", error);
            throw error;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error("🔥 Server Error in /api/admin/financials:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message,
            details: error,
            hint: "Verifique se todas as migrações foram aplicadas e se as colunas existem."
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const { transactionId, action, proofUrl, observations, approvedItems, refusedItems } = await request.json();
        if (!transactionId || !action) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Dados incompletos"
            }, {
                status: 400
            });
        }
        // 1. Get the withdrawal transaction
        const { data: tx, error: txError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').select('*').eq('id', transactionId).single();
        if (txError || !tx) throw txError || new Error("Transação não encontrada");
        if (action === 'audit') {
            // Update individual items status
            if (approvedItems && approvedItems.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                    status: 'Aprovado'
                }).in('id', approvedItems);
            }
            if (refusedItems && refusedItems.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                    status: 'Recusado'
                }).in('id', refusedItems);
            }
            if (observations) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                    observations
                }).eq('id', transactionId);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        } else if (action === 'liquidate') {
            // 1. Fetch linked items to calculate approved/refused totals
            const { data: items } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').select('amount, status').eq('withdrawal_id', transactionId);
            const totalApproved = items?.filter((i)=>i.status === 'Aprovado' || i.status === 'Liquidado').reduce((acc, curr)=>acc + Number(curr.amount), 0) || 0;
            const totalRefused = items?.filter((i)=>i.status === 'Recusado').reduce((acc, curr)=>acc + Number(curr.amount), 0) || 0;
            const totalRequested = Math.abs(Number(tx.amount));
            // Liquidate: Change status to Liquidado
            const { error: updateTxError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                status: 'Liquidado',
                proof_url: proofUrl,
                observations: observations,
                amount: -totalApproved,
                description: `Saque liquidado (R$ ${totalApproved.toLocaleString('pt-BR')}). Estornado: R$ ${totalRefused.toLocaleString('pt-BR')}. Obs: ${observations || 'Sem observações'}`
            }).eq('id', transactionId);
            if (updateTxError) throw updateTxError;
            // Update linked items to Liquidado
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                status: 'Liquidado'
            }).eq('withdrawal_id', transactionId).eq('status', 'Aprovado');
            // Handle Balance Adjustment
            const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('profiles').select('balance_available, balance_processing').eq('id', tx.user_id).single();
            // Processing: Remove the ENTIRE requested amount that was held
            // Available: Return the REFUSED amount
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('profiles').update({
                balance_processing: (Number(profile?.balance_processing) || 0) - totalRequested,
                balance_available: (Number(profile?.balance_available) || 0) + totalRefused
            }).eq('id', tx.user_id);
            // If there were refused items, create a reversal transaction for clarity in extract
            if (totalRefused > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').insert({
                    user_id: tx.user_id,
                    amount: totalRefused,
                    type: 'Estorno de Saque (Auditado)',
                    status: 'Disponível',
                    description: `Valor estornado do saque ${transactionId} devido a itens recusados na auditoria.`,
                    reference_type: 'withdrawal',
                    reference_id: transactionId
                });
                // Unlink refused items from this withdrawal so they can be requested again if corrected
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                    withdrawal_id: null
                }).eq('withdrawal_id', transactionId).eq('status', 'Recusado');
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Saque liquidado: R$ ${totalApproved.toLocaleString('pt-BR')} pagos.`
            });
        } else if (action === 'refuse') {
            // Refuse entire withdrawal: Return money to available balance
            const { error: updateTxError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                status: 'Recusado',
                observations: observations
            }).eq('id', transactionId);
            if (updateTxError) throw updateTxError;
            // Move balance back from processing to available
            const amountToReturn = Math.abs(Number(tx.amount));
            const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('profiles').select('balance_available, balance_processing').eq('id', tx.user_id).single();
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('profiles').update({
                balance_available: (Number(profile?.balance_available) || 0) + amountToReturn,
                balance_processing: (Number(profile?.balance_processing) || 0) - amountToReturn
            }).eq('id', tx.user_id);
            // Also un-link commissions
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('financial_transactions').update({
                withdrawal_id: null,
                status: 'Disponível'
            }).eq('withdrawal_id', transactionId);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: "Saque recusado e saldo retornado"
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Ação inválida"
        }, {
            status: 400
        });
    } catch (error) {
        console.error("Erro na ação administrativa:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__98f6c2b2._.js.map