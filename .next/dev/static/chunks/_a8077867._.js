(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://vbbjrrwgjxmdzgpnnryy.supabase.co") || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_7p7odlQAuB_pmeQdVYtLGQ_wRwuG2kU") || 'YOUR_SUPABASE_ANON_KEY';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SimulationProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SimulationProvider",
    ()=>SimulationProvider,
    "useSimulation",
    ()=>useSimulation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const defaultUser = {
    id: "vend_001",
    name: "Maria Silva",
    email: "maria.silva@delta.com.br",
    company: "Contabilidade Central",
    role: "seller",
    sales_total: 8450.00,
    level: "Prata",
    xp: 1250,
    wallet: 450.00,
    equippedBadge: "Start",
    salesCount60Days: 24,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA65jbQbRFT_PDlvYMVTP3jdi6Y0M5XKach0uVKCc-u2nNiGY4dXathU9JL2D1fYBSRDJi1KuMjH_m4OZJTcO-vfJ3w0gVvuveIyKE23dzwugAuCd7laQ0bZE2IrG5aFxSPVmApOaPv2qJGIw4iLTESk8t2EBUYQJBTjzFFqpxVPxizXpfvDG_E8MSjXrNJCg4v3hJiYh3thS6oAAbbg3lP9pJL9tg8WUQXGUnMB8Z9CS_Dx6TE6QSzjjnWEoYy5CQSiCjDAc63_M",
    preferences: {
        darkMode: true
    }
};
const SimulationContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function SimulationProvider({ children }) {
    _s();
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultUser);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const updateUser = (updates)=>{
        setCurrentUser((prev)=>({
                ...prev,
                ...updates
            }));
    };
    const logout = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        setIsAuthenticated(false);
        window.location.reload();
    };
    const toggleRole = ()=>{
        setCurrentUser((prev)=>{
            if (prev.role === "seller") {
                return {
                    id: "admin_master",
                    name: "Helio (Admin)",
                    email: "helio@delta.com.br",
                    company: "Delta Estrategista",
                    role: "admin",
                    sales_total: 25480.00,
                    level: "Ouro",
                    xp: 5000,
                    wallet: 1500.00,
                    salesCount60Days: 120,
                    avatar: undefined,
                    preferences: {
                        darkMode: true
                    }
                };
            } else {
                return defaultUser;
            }
        });
    };
    // Load actual profile if connected to Supabase
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationProvider.useEffect": ()=>{
            const loadProfile = {
                "SimulationProvider.useEffect.loadProfile": async ()=>{
                    try {
                        const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                        if (session) {
                            setIsAuthenticated(true);
                            const { data: profile } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('*').eq('id', session.user.id).single();
                            if (profile) {
                                setCurrentUser({
                                    "SimulationProvider.useEffect.loadProfile": (prev)=>({
                                            ...prev,
                                            id: profile.id,
                                            name: profile.full_name,
                                            role: profile.role,
                                            level: profile.level,
                                            xp: profile.xp || 0,
                                            wallet: Number(profile.wallet) || 0,
                                            email: profile.email
                                        })
                                }["SimulationProvider.useEffect.loadProfile"]);
                            }
                        } else {
                            setIsAuthenticated(false);
                        }
                    } catch (err) {
                        console.warn("Supabase profile load failed. Using simulated user.");
                    } finally{
                        setLoading(false);
                    }
                }
            }["SimulationProvider.useEffect.loadProfile"];
            loadProfile();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "SimulationProvider.useEffect": (_event, session)=>{
                    setIsAuthenticated(!!session);
                    if (!session) {
                        setLoading(false);
                    } else {
                        loadProfile();
                    }
                }
            }["SimulationProvider.useEffect"]);
            return ({
                "SimulationProvider.useEffect": ()=>subscription.unsubscribe()
            })["SimulationProvider.useEffect"];
        }
    }["SimulationProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationProvider.useEffect": ()=>{
            if (currentUser.preferences?.darkMode) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }["SimulationProvider.useEffect"], [
        currentUser.preferences?.darkMode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationContext.Provider, {
        value: {
            currentUser,
            toggleRole,
            updateUser,
            isAuthenticated,
            loading,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/components/SimulationProvider.tsx",
        lineNumber: 148,
        columnNumber: 9
    }, this);
}
_s(SimulationProvider, "ZtIAoYpI6oVJcUAa1xIFo1o4DtI=");
_c = SimulationProvider;
function useSimulation() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SimulationContext);
    if (context === undefined) {
        throw new Error("useSimulation must be used within a SimulationProvider");
    }
    return context;
}
_s1(useSimulation, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "SimulationProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_a8077867._.js.map