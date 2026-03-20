import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY não encontrada. Operações administrativas podem falhar.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
