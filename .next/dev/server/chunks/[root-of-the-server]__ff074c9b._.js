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
"[project]/app/api/customers/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
;
// Helper to convert empty strings to null for Supabase
const sanitizeData = (obj)=>{
    const sanitized = {
        ...obj
    };
    Object.keys(sanitized).forEach((key)=>{
        if (sanitized[key] === "") sanitized[key] = null;
    });
    return sanitized;
};
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customers').select('*, contacts:customer_contacts(*)');
    if (role !== 'admin' && userId) {
        query = query.eq('seller_id', userId);
    }
    const { data, error } = await query.order('created_at', {
        ascending: false
    });
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
    // Map DB values back to UI labels
    const mappedData = (data || []).map((customer)=>({
            ...customer,
            origin: customer.origin === 'Próprio' ? 'Renovação' : customer.origin === 'Concorrente' ? 'Migração' : customer.origin
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mappedData);
}
async function POST(request) {
    const data = await request.json();
    const { seller, sellerId, contacts, ...rest } = data;
    // Clean documents
    if (rest.doc) rest.doc = rest.doc.replace(/\D/g, '');
    if (rest.responsible_cpf) rest.responsible_cpf = rest.responsible_cpf.replace(/\D/g, '');
    // Map UI labels to DB values
    const dbRest = {
        ...rest,
        origin: rest.origin === 'Renovação' ? 'Próprio' : rest.origin === 'Migração' ? 'Concorrente' : rest.origin
    };
    const sanitizedRest = sanitizeData(dbRest);
    const { data: newCustomer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customers').insert([
        {
            ...sanitizedRest,
            seller_name: seller,
            seller_id: sellerId,
            total_spent: 0
        }
    ]).select().single();
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Erro ao criar cliente: ${error.message}`
        }, {
            status: 500
        });
    }
    // Insert contacts if any
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        const contactsToInsert = contacts.map((c)=>{
            return {
                customer_id: newCustomer.id,
                name: c.tag || c.type || 'Geral',
                department: c.tag || 'Geral',
                email: c.type === 'Email' ? c.value : null,
                phone: c.type === 'WhatsApp' || c.type === 'Telefone' ? c.value : null
            };
        });
        const { error: contactsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customer_contacts').insert(contactsToInsert);
        if (contactsError) {
            console.error('Error inserting contacts:', contactsError);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(newCustomer, {
        status: 201
    });
}
async function PUT(request) {
    const data = await request.json();
    const { id, contacts, ...updates } = data;
    // Clean documents
    if (updates.doc) updates.doc = updates.doc.replace(/\D/g, '');
    if (updates.responsible_cpf) updates.responsible_cpf = updates.responsible_cpf.replace(/\D/g, '');
    // Map UI labels to DB values
    const dbUpdates = {
        ...updates,
        origin: updates.origin === 'Renovação' ? 'Próprio' : updates.origin === 'Migração' ? 'Concorrente' : updates.origin
    };
    const sanitizedUpdates = sanitizeData(dbUpdates);
    const { data: updatedCustomer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customers').update(sanitizedUpdates).eq('id', id).select().single();
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Erro ao atualizar cliente: ${error.message}`
        }, {
            status: 500
        });
    }
    // Handle contacts: simpler to delete and recreate
    if (contacts && Array.isArray(contacts)) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customer_contacts').delete().eq('customer_id', id);
        if (contacts.length > 0) {
            const contactsToInsert = contacts.map((c)=>{
                return {
                    customer_id: id,
                    name: c.tag || c.type || 'Geral',
                    department: c.tag || 'Geral',
                    email: c.type === 'Email' ? c.value : null,
                    phone: c.type === 'WhatsApp' || c.type === 'Telefone' ? c.value : null
                };
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customer_contacts').insert(contactsToInsert);
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(updatedCustomer);
}
async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Missing ID"
    }, {
        status: 400
    });
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('customers').delete().eq('id', id);
    if (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ff074c9b._.js.map