const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration() {
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', 'ensure_customer_unique_doc.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration to add unique constraint on customers(doc)...');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        if (error.message.includes('function "exec_sql" does not exist')) {
            console.log('\n--- MANUAL ACTION REQUIRED ---');
            console.log('Please copy the content of supabase/migrations/ensure_customer_unique_doc.sql and run it in the Supabase SQL Editor.');
            console.log('------------------------------\n');
        } else {
            console.error('Error applying migration:', error);
        }
    } else {
        console.log('✅ Migration applied successfully!');
    }
}

applyMigration();
