
import fs from 'fs';

async function run() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

        if (!urlMatch || !keyMatch) {
            console.error("Erro: Credenciais não encontradas no .env.local");
            return;
        }

        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        console.log("URL:", url);

        const res = await fetch(`${url}/rest/v1/products?select=*`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log("Produtos encontrados:", data.length);
            data.forEach(p => {
                console.log(`- ${p.name}`);
                console.log(`  ID: ${p.id}, Category: ${p.category}, Active: ${p.is_active}, Price: ${p.price}`);
            });
        } else {
            const text = await res.text();
            console.log("Erro REST:", text);
        }
    } catch (e) {
        console.error("Erro na execução:", e);
    }
}

run();
