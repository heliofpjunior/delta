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
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://vbbjrrwgjxmdzgpnnryy.supabase.co") || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_7p7odlQAuB_pmeQdVYtLGQ_wRwuG2kU") || 'YOUR_SUPABASE_ANON_KEY';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/app/api/integracao/vendas/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
;
;
;
const CERTCONTROL_API_URL = 'https://service.certcontrol.com.br';
const CERTCONTROL_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiZGRkZDRlNjdhNWRjZDcxMTJiMWUyZjI5ZDZlYmYwZjFjNmIxNDA3MWQxNWZkNzY5NzgwOTVlOWU2ZmM1MjRmNTk4MzFjOTQwMTM1OWZjMzIiLCJpYXQiOjE3NzYyNTc5NTkuNDYxOTM4LCJuYmYiOjE3NzYyNTc5NTkuNDYxOTQxLCJleHAiOjE4MDc3NTgwMDAuMDA2MzczLCJzdWIiOiI1NzYxIiwic2NvcGVzIjpbImludGVncmFjYW8iXX0.st0TAVv9cydPqAZH25C1KCNWHZsnKNmKbwd8xHBUKPshLkKImYzetuBtzqc-Ey7OO7C0FY04WMbgTaV9V44frs3dhYgxerwbTcmf1OVz6DVwe6Q-r28LQxxXsHX_8Q-J2Mh_2tuMf324cONr4uQZAJBLmVRgh2CFZTyCAlnsyI0dOi-Kqt_8OZOldBb52O0JjxvY1OS38xq_PbLhnkMkvZgZevay8NKeORXUki_YUv3zRDgZkPcQ8Orn8oHeaTzGxf3pn3YfC5yxY48ItLAiSB4-_2mLryt88HNCGr0ib2zcz_V2Ko3QprFKbbVo_O4c4ACSDXF5q6oQ5trYQweInVZglMcb9nsnqcgu9it1qT1YEcII1hTrBhXk4yNoe1kJOgg_HX3lRNCUx7ZOjrb2RU56MRZIRLOKYr19whS_3WBzGsUBvfo2ikDFars3s1WcGWoHKk9LiY8NChCq5gzFPF0nbdzVb-kQ0F0W0pQMCi0mpmYQV4hETJdTTAXA6WY-nilSpRbcndW-eGIFyFbTJWtp9al8aIVvm2nQgvv6HZpfhsGQQDzElXKDbzXstqwwNcdMIbzBh-tzqCVePlRJ6Wfx3uwd10QGWfGnDFH59Vln7duD_bjnv9-77JM-MzO4Dqh47gJ97jczZak4zPO13GysuQLisHcrD87VHFyY514';
async function POST(request) {
    try {
        const formData = await request.formData();
        // Extract fields
        const doc = formData.get('doc');
        const name = formData.get('name');
        const productId = Number(formData.get('productId'));
        const customPrice = Number(formData.get('customPrice'));
        const email = formData.get('email');
        const phone = formData.get('phone');
        const cep = formData.get('cep');
        const street = formData.get('street');
        const number = formData.get('number');
        const neighborhood = formData.get('neighborhood');
        const city = formData.get('city');
        const state = formData.get('state');
        const complement = formData.get('complement');
        const ibge = formData.get('ibge');
        const videoConference = formData.get('videoConference') === 'true';
        const sellerId = formData.get('seller_id');
        const sellerCommission = Number(formData.get('seller_commission'));
        const legalRepName = formData.get('legalRepName');
        const legalRepCpf = (formData.get('legalRepCpf') || '').replace(/\D/g, '');
        const calculationMemory = formData.get('calculation_memory');
        const partnerCost = Number(formData.get('partner_cost') || 0);
        const taxesValue = Number(formData.get('taxes') || 0);
        const fixedFees = Number(formData.get('fixed_fees') || 0);
        const isDraft = formData.get('isDraft') === 'true';
        const orderId = formData.get('id');
        const isUpdateStatusOnly = formData.get('isUpdateStatusOnly') === 'true';
        const newStatus = formData.get('status');
        // Special case: Only updating status (e.g., archiving)
        if (isUpdateStatusOnly && orderId && newStatus) {
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('orders').update({
                status: newStatus
            }).eq('id', orderId);
            if (updateError) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: `Erro ao atualizar status: ${updateError.message}`
                }, {
                    status: 500
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Status atualizado para ${newStatus}`
            }, {
                status: 200
            });
        }
        // Extract files
        const files = formData.getAll('files');
        let protocol = "";
        let supplierData = null;
        let vendaUuid = null;
        let productMediaType = undefined;
        if (!isDraft) {
            // 1. Fetch linkage details for the product (Only needed for real sales)
            const { data: product, error: productError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('products').select(`
                    *,
                    supplier_products (
                        *,
                        supplier_tables (*)
                    )
                `).eq('id', productId).single();
            if (productError || !product) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Produto não encontrado ou sem vínculo."
                }, {
                    status: 404
                });
            }
            const supplierProduct = product.supplier_products;
            const supplierTable = supplierProduct?.supplier_tables;
            productMediaType = product.media_type;
            if (!supplierProduct?.external_id || !supplierTable?.external_id) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Este produto não possui mapeamento ID de Tabela/Produto para o fornecedor."
                }, {
                    status: 400
                });
            }
            // 2. Prepare payload for CertControl
            const cleanDoc = doc.replace(/\D/g, '');
            const cleanPhone = phone.replace(/\D/g, '');
            const areaCode = cleanPhone.substring(0, 2);
            const phoneNumber = cleanPhone.substring(2);
            const launchType = videoConference ? 7 : 1;
            const cleanIbge = (ibge || '').replace(/\D/g, '');
            const ibgeCode = cleanIbge.length === 7 ? cleanIbge : '0000000';
            const certControlPayload = {
                venda: {
                    produto_id: String(supplierProduct.external_id),
                    tabela_id: String(supplierTable.external_id),
                    valor_total: Number(customPrice),
                    tipo_lancamento_id: String(launchType)
                },
                certificado: {
                    nome: name,
                    documento: cleanDoc,
                    documento_tipo: cleanDoc.length === 14 ? 'CNPJ' : 'CPF',
                    emails: [
                        email
                    ],
                    celular: {
                        codigo_area: areaCode,
                        numero: phoneNumber
                    },
                    endereco: {
                        cep: cep.replace(/\D/g, ''),
                        uf: state,
                        municipio: city,
                        codigo_ibge: ibgeCode,
                        logradouro: street,
                        numero: number,
                        bairro: neighborhood,
                        complemento: complement || ""
                    },
                    ...cleanDoc.length === 14 ? {
                        representante_legal: {
                            nome: legalRepName,
                            documento: legalRepCpf
                        }
                    } : {}
                },
                faturamento: {
                    nome: name,
                    documento: cleanDoc,
                    documento_tipo: cleanDoc.length === 14 ? 'CNPJ' : 'CPF',
                    emails: [
                        email
                    ],
                    celular: {
                        codigo_area: areaCode,
                        numero: phoneNumber
                    },
                    endereco: {
                        cep: cep.replace(/\D/g, ''),
                        uf: state,
                        municipio: city,
                        codigo_ibge: ibgeCode,
                        logradouro: street,
                        numero: number,
                        bairro: neighborhood,
                        complemento: complement || ""
                    }
                }
            };
            // 3. Call CertControl API (Order Creation)
            const certResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].post(`${CERTCONTROL_API_URL}/api/integracao/vendas`, certControlPayload, {
                headers: {
                    'Authorization': `Bearer ${CERTCONTROL_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            supplierData = certResponse.data.data;
            protocol = `PEDIDO - ${supplierData.id}`;
            vendaUuid = supplierData.uuid;
            // 4. Handle Document Upload (if files exist)
            if (files.length > 0) {
                try {
                    const docsFormData = new FormData();
                    for (const file of files){
                        docsFormData.append('files[]', file);
                    }
                    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].post(`${CERTCONTROL_API_URL}/api/public/venda/${vendaUuid}/documentos`, docsFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } catch (docError) {
                    console.error("Document Upload Error:", docError.response?.data || docError.message);
                // We don't fail the whole order if docs fail, just log it
                }
            }
        } else {
            // It's a Draft
            // Generate a temporary protocol if it doesn't have one
            protocol = `DELTA-R-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        // 5. Persist Order in Supabase
        const orderData = {
            status: isDraft ? 'Rascunho' : 'Pendente',
            holder_name: name || (isDraft ? 'Rascunho Incompleto' : ''),
            doc: doc || (isDraft ? '000.000.000-00' : ''),
            product_id: productId || null,
            final_price: customPrice || 0,
            seller_commission: sellerCommission || 0,
            address_details: {
                cep,
                street,
                number,
                neighborhood,
                city,
                state,
                complement
            },
            technical_details: {
                mediaType: productMediaType,
                videoConference,
                appointmentDate: formData.get('appointmentDate'),
                appointmentTime: formData.get('appointmentTime')
            },
            seller_id: sellerId,
            billing_details: {
                billingType: formData.get('billingType'),
                billingDoc: formData.get('billingDoc'),
                billingName: formData.get('billingName'),
                billingEmail: formData.get('billingEmail'),
                billingPhone: formData.get('billingPhone'),
                billingCep: formData.get('billingCep'),
                billingStreet: formData.get('billingStreet'),
                billingNumber: formData.get('billingNumber'),
                billingNeighborhood: formData.get('billingNeighborhood'),
                billingCity: formData.get('billingCity'),
                billingState: formData.get('billingState')
            },
            origin: formData.get('origin') || 'Venda Direta',
            calculation_memory: calculationMemory ? JSON.parse(calculationMemory) : null,
            partner_cost: partnerCost,
            taxes: taxesValue,
            fixed_fees: fixedFees
        };
        // If not draft, add supplier metadata
        if (!isDraft && supplierData) {
            orderData.protocol = protocol;
            orderData.supplier_order_id = supplierData.id;
            orderData.supplier_uuid = vendaUuid;
            orderData.supplier_status = supplierData.status;
            orderData.supplier_link_pagamento = supplierData.link_pagamento;
            orderData.supplier_link_agendamento = supplierData.link_agendamento;
            orderData.supplier_product_name = supplierData.produto;
            orderData.supplier_valor_total = Number(supplierData.valor_total || 0);
            orderData.supplier_valor_comissao = supplierData.valor_comissao ? Number(supplierData.valor_comissao) : 0;
            orderData.supplier_valor_desconto = Number(supplierData.valor_desconto || 0);
            orderData.supplier_valor_acrescimo = Number(supplierData.valor_acrescimo || 0);
            orderData.supplier_valor_tabela = supplierData.valor_tabela ? Number(supplierData.valor_tabela) : 0;
        } else if (isDraft) {
            // Ensure we keep the protocol we had or use the new one
            orderData.protocol = protocol;
        }
        if (orderId) {
            orderData.id = orderId;
        }
        const { error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('orders').upsert([
            orderData
        ]);
        if (orderError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Erro ao salvar rascunho no banco: ${orderError.message}`
            }, {
                status: 500
            });
        }
        // --- INTELLIGENT CRM: Automatic Customer Registration ---
        if (!isDraft && name && doc) {
            try {
                // Clean document for consistent lookup and storage
                const cleanDocNumber = doc.replace(/\D/g, '');
                // Calculate estimated expiry date
                let calculatedExpiry = null;
                if (productMediaType) {
                    const now = new Date();
                    if (productMediaType.toLowerCase().includes('token') || productMediaType.toLowerCase().includes('cartão')) {
                        // Usually A3 (3 years)
                        now.setFullYear(now.getFullYear() + 3);
                    } else {
                        // Usually A1 (1 year)
                        now.setFullYear(now.getFullYear() + 1);
                    }
                    calculatedExpiry = now.toISOString().split('T')[0];
                }
                // Get current seller name if we only have ID
                let finalSellerName = formData.get('seller_name');
                if (!finalSellerName && sellerId) {
                    const { data: p } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('profiles').select('full_name').eq('id', sellerId).single();
                    finalSellerName = p?.full_name || 'Vendedor';
                }
                // 1. Try to get existing customer to update total_spent (Using admin client and clean doc)
                const { data: existingCustomer } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('customers').select('id, total_spent').eq('doc', cleanDocNumber).maybeSingle();
                const newSpent = (Number(existingCustomer?.total_spent) || 0) + (customPrice || 0);
                // 2. Upsert Customer
                const customerPayload = {
                    doc: cleanDocNumber,
                    name: name,
                    email: email,
                    phone: phone,
                    status: 'Ativo',
                    origin: 'Próprio',
                    seller_name: finalSellerName,
                    seller_id: sellerId,
                    total_spent: newSpent,
                    last_contact: new Date().toISOString(),
                    expiry_date: calculatedExpiry,
                    certificate_type: productMediaType || 'Digital',
                    // Address Integration
                    address_zip: cep,
                    address_street: street,
                    address_number: number,
                    address_neighborhood: neighborhood,
                    address_city: city,
                    address_state: state,
                    address_complement: complement
                };
                // PJ Specific: Link representative
                if (cleanDocNumber.length === 14 && legalRepCpf) {
                    customerPayload.responsible_cpf = legalRepCpf;
                }
                const { error: crmError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('customers').upsert(customerPayload, {
                    onConflict: 'doc'
                });
                if (crmError) {
                    console.error("🔴 CRM Upsert Error:", crmError.message);
                } else {
                    console.log(`✅ Customer ${name} (${cleanDocNumber}) registered/updated successfully.`);
                }
            } catch (crmError) {
                console.error("🔴 CRM Auto-registration Exception:", crmError.message);
            // We don't block the order if CRM sync fails
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: isDraft ? "Rascunho salvo!" : "Pedido integrado com sucesso!",
            protocol: protocol,
            paymentLink: supplierData?.link_pagamento,
            scheduleLink: supplierData?.link_agendamento,
            uuid: vendaUuid
        }, {
            status: 201
        });
    } catch (error) {
        console.error("🔴 Venda Integration Error:", error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Erro na integração com CertControl: " + (error.response?.data?.message || error.message)
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');
        if (!orderId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ID do pedido é obrigatório."
            }, {
                status: 400
            });
        }
        // 1. Fetch current status to verify deletion permission
        // We use supabaseAdmin to ensure we can check the status regardless of RLS for this safety check
        const { data: order, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('orders').select('status, protocol').eq('id', orderId).single();
        if (fetchError || !order) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Pedido não encontrado."
            }, {
                status: 404
            });
        }
        // 2. CRITICAL SAFETY CHECK: Only 'Rascunho' can be deleted
        if (order.status !== 'Rascunho') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Operação não permitida. Apenas rascunhos podem ser excluídos. Este pedido tem status: ${order.status}`
            }, {
                status: 403
            });
        }
        // 3. Perform Deletion
        const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from('orders').delete().eq('id', orderId);
        if (deleteError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Erro ao excluir rascunho: ${deleteError.message}`
            }, {
                status: 500
            });
        }
        console.log(`✅ Order ${orderId} (${order.protocol}) deleted successfully.`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Rascunho excluído com sucesso!"
        }, {
            status: 200
        });
    } catch (error) {
        console.error("🔴 Delete Order Error:", error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Erro na exclusão do rascunho: " + error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__74bc2c07._.js.map