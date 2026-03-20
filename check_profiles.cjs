
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vbbjrrwgjxmdzgpnnryy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmpycndnanhtZHpncG5ucnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYzNzI3MSwiZXhwIjoyMDg3MjEzMjcxfQ.e35OpmH_p9EIDPBm1slwy8dZYeIt-TfvPbEJFRF4ig8');

async function check() {
    try {
        console.log("Checking profiles columns...");
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        if (data && data.length > 0) {
            console.log("Profiles Keys:", Object.keys(data[0]));
        } else {
            console.log("No profile records found.");
        }
        if (error) console.error(error);
    } catch (e) {
        console.error(e);
    }
}
check();
