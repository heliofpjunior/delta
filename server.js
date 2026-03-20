import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// --- Mock Database (In-Memory) ---
let sales = [
    { id: 536179, protocol: '20260129-977E', holder: 'Lutero E Associados', product: 'e-CNPJ A1 - 1 Ano', seller: 'Maria Silva', seller_id: 'vend_001', status: 'Pendente', statusColor: 'amber', date: '2026-01-29', expiration_date: '2027-01-29', source: 'manual', doc: '12.345.678/0001-90', email: 'contato@lutero.com.br', phone: '(11) 98877-6655' },
    { id: 536180, protocol: '20260129-45D1', holder: 'Montenegro E Duarte', product: 'e-CPF A3 - 3 Anos', seller: 'Maria Silva', seller_id: 'vend_001', status: 'Pago', statusColor: 'emerald', date: '2026-01-29', expiration_date: '2029-01-29', source: 'link_venda', doc: '123.456.789-00', email: 'jorge@montenegro.com', phone: '(11) 97766-5544' },
    { id: 535900, protocol: '20260120-A2B3', holder: 'Verdugo E Rios', product: 'e-CPF A1', seller: 'Vendedor Externo B', seller_id: 'vend_002', status: 'Cancelado', statusColor: 'rose', date: '2026-01-20', expiration_date: '-', source: 'marketing', doc: '987.654.321-11', email: 'verdugo@gmail.com', phone: '(11) 96655-4433' }
];

let customers = [
    { id: 'cust_001', name: 'Lutero E Associados', doc: '12.345.678/0001-90', email: 'contato@lutero.com.br', phone: '(11) 98877-6655', last_purchase: '2026-01-29', total_spent: 149.90, seller_id: 'vend_001', has_certificate: true, certificate_expiration: '2026-03-15', avatar: null },
    { id: 'cust_002', name: 'Montenegro E Duarte', doc: '123.456.789-00', email: 'jorge@montenegro.com', phone: '(11) 97766-5544', last_purchase: '2026-01-29', total_spent: 299.00, seller_id: 'vend_001', has_certificate: true, certificate_expiration: '2027-01-29', avatar: null },
    { id: 'cust_003', name: 'Fictitious Corp', doc: '99.888.777/0001-66', email: 'vendas@fictitious.com', phone: '(21) 91122-3344', last_purchase: null, total_spent: 0, seller_id: 'vend_001', has_certificate: false, avatar: null },
    { id: 'cust_004', name: 'João das Leads', doc: '444.555.666-77', email: 'joao@leads.com', phone: '(31) 99988-7766', last_purchase: null, total_spent: 0, seller_id: 'vend_001', has_certificate: true, certificate_expiration: '2025-12-20', avatar: null }
];

let userProfile = {
    id: 'vend_001',
    name: 'Maria Silva',
    email: 'maria.silva@delta.com.br',
    phone: '(11) 98877-6655',
    company: 'Contabilidade Central',
    role: 'seller',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA65jbQbRFT_PDlvYMVTP3jdi6Y0M5XKach0uVKCc-u2nNiGY4dXathU9JL2D1fYBSRDJi1KuMjH_m4OZJTcO-vfJ3w0gVvuveIyKE23dzwugAuCd7laQ0bZE2IrG5aFxSPVmApOaPv2qJGIw4iLTESk8t2EBUYQJBTjzFFqpxVPxizXpfvDG_E8MSjXrNJCg4v3hJiYh3thS6oAAbbg3lP9pJL9tg8WUQXGUnMB8Z9CS_Dx6TE6QSzjjnWEoYy5CQSiCjDAc63_M',
    sales_total: 8450,
    preferences: { darkMode: true, notifications: true },
    fiscal_data: {
        legal_name: 'Maria Silva Santos LTDA',
        doc: '12.345.678/0001-90',
        address: 'Rua das Flores, 123, São Paulo - SP',
        accounting_info: 'Contabilidade Central S/S'
    },
    pix_key: 'maria.silva@delta.com.br'
};

// Financials State
let financials = {
    balance_available: 1240.50,
    balance_pending: 450.00,
    total_withdrawn: 3200.00,
    history: [
        { id: 'tx_001', date: '2024-02-18', type: 'commission', description: 'Comissão - Certificado e-CPF A1', amount: 45.00, status: 'completed' },
        { id: 'tx_002', date: '2024-02-19', type: 'commission', description: 'Comissão - Certificado e-CNPJ A1', amount: 75.00, status: 'completed' },
        { id: 'tx_003', date: '2024-02-15', type: 'withdrawal', description: 'Saque Solicitado (PIX)', amount: -500.00, status: 'completed' }
    ],
    withdrawals: []
};

// --- API Routes ---

// Profile Routes
app.get('/api/me', (req, res) => {
    res.json(userProfile);
});

app.put('/api/me', (req, res) => {
    const update = req.body;
    if (update.name) userProfile.name = update.name;
    if (update.email) userProfile.email = update.email;
    if (update.phone) userProfile.phone = update.phone;
    if (update.avatar) userProfile.avatar = update.avatar;
    if (update.preferences) userProfile.preferences = { ...userProfile.preferences, ...update.preferences };

    // Phase 5: Fiscal & PIX
    if (update.fiscal_data) userProfile.fiscal_data = { ...userProfile.fiscal_data, ...update.fiscal_data };
    if (update.pix_key) userProfile.pix_key = update.pix_key;

    res.json({ success: true, data: userProfile });
});

// Financial Routes
app.get('/api/finance/stats', (req, res) => {
    res.json({
        available: financials.balance_available,
        pending: financials.balance_pending,
        withdrawn: financials.total_withdrawn
    });
});

app.get('/api/finance/history', (req, res) => {
    res.json(financials.history);
});

app.post('/api/finance/withdraw', (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > financials.balance_available) {
        return res.status(400).json({ success: false, message: 'Saldo insuficiente ou valor inválido.' });
    }

    const newWithdrawal = {
        id: 'wd_' + Math.random().toString(36).substring(2, 6),
        date: new Date().toISOString().split('T')[0],
        type: 'withdrawal',
        description: 'Solicitação de Saque',
        amount: -parseFloat(amount),
        status: 'pending'
    };

    financials.balance_available -= parseFloat(amount);
    financials.history.unshift(newWithdrawal);
    financials.withdrawals.push(newWithdrawal);

    res.json({ success: true, data: newWithdrawal });
});

// Get all customers (with seller isolation)
app.get('/api/customers', (req, res) => {
    const { seller_id, role } = req.query;
    if (role === 'admin') {
        return res.json(customers);
    }
    const filteredCustomers = customers.filter(c => c.seller_id === seller_id);
    res.json(filteredCustomers);
});

// Create a new customer manually
app.post('/api/customers', (req, res) => {
    const customerData = req.body;
    const newCustomer = {
        id: 'cust_' + Math.random().toString(36).substring(2, 6),
        name: customerData.name,
        doc: customerData.doc,
        email: customerData.email,
        phone: customerData.phone,
        last_purchase: null,
        total_spent: 0,
        seller_id: customerData.seller_id || 'vend_001',
        has_certificate: customerData.has_certificate || false,
        certificate_expiration: customerData.certificate_expiration || null
    };
    customers.push(newCustomer);
    res.status(201).json({ success: true, data: newCustomer });
});

// Update an existing customer
app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = customers.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }

    customers[index] = {
        ...customers[index],
        ...updateData,
        has_certificate: updateData.has_certificate ?? customers[index].has_certificate,
        certificate_expiration: updateData.certificate_expiration !== undefined ? updateData.certificate_expiration : customers[index].certificate_expiration
    };
    res.json({ success: true, data: customers[index] });
});

// Get all sales (with simple role-based filtering simulated via query param)
app.get('/api/sales', (req, res) => {
    const { seller_id, role } = req.query;
    if (role === 'admin') {
        return res.json(sales);
    }
    const filteredSales = sales.filter(s => s.seller_id === seller_id);
    res.json(filteredSales);
});

// Create a new sale
app.post('/api/sales', (req, res) => {
    const { venda, certificado } = req.body;

    const newSale = {
        id: Math.floor(Math.random() * 900000) + 100000,
        protocol: new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        holder: certificado.nome,
        product: venda.produto_id, // Simplified for mock
        seller: 'Maria Silva', // Should come from session/auth
        seller_id: venda.vendedor_id,
        status: 'Pendente',
        statusColor: 'amber',
        date: new Date().toISOString().split('T')[0],
        doc: certificado.documento,
        email: certificado.emails[0],
        phone: `(${certificado.celular.codigo_area}) ${certificado.celular.numero}`,
        uuid: crypto.randomUUID(),
        source: venda.origem || 'manual',
        expiration_date: venda.tipo_pagamento === 'recorrente' ? 'Calculando...' : '-', // Placeholder logic
        link_agendamento: 'https://service.certcontrol.com.br/agendamento/' + Buffer.from(Date.now().toString()).toString('base64')
    };

    sales.unshift(newSale);

    // Sync Customer
    let customer = customers.find(c => c.doc === certificado.documento);
    if (customer) {
        customer.last_purchase = newSale.date;
        customer.total_spent += newSale.valor_total || 0;
    } else {
        customers.push({
            id: 'cust_' + Math.random().toString(36).substring(2, 6),
            name: certificado.nome,
            doc: certificado.documento,
            email: certificado.emails[0],
            phone: `(${certificado.celular.codigo_area}) ${certificado.celular.numero}`,
            last_purchase: newSale.date,
            total_spent: venda.valor_total,
            seller_id: venda.vendedor_id
        });
    }

    res.status(201).json({ success: true, data: newSale });
});

// Mock available times
app.get('/api/public/horarios', (req, res) => {
    res.json(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
