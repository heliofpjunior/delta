let currentUser = {
    id: 'vend_001',
    name: 'Maria Silva',
    company: 'Contabilidade Central',
    role: 'seller',
    sales_total: 8450.00 // Added for gamification
};

document.addEventListener('DOMContentLoaded', () => {

    window.toggleSellerRoleSimulation = function () {
        if (currentUser.id === 'vend_001') {
            currentUser = { id: 'admin_master', name: 'Helio (Admin)', company: 'Delta Estrategista', role: 'admin' };
        } else {
            currentUser = { id: 'vend_001', name: 'Maria Silva', company: 'Contabilidade Central', role: 'seller' };
        }
        updateSellerUI();
        filterDataBySeller();
        alert(`Simulação: Agora você está logado como ${currentUser.name} (${currentUser.role === 'admin' ? 'Enxerga TUDO' : 'Enxerga apenas as SUAS vendas'})`);
    };

    function updateGamificationUI() {
        const tierBadge = document.getElementById('user-tier-badge');
        const tierName = document.getElementById('user-tier-name');
        const salesDisplay = document.getElementById('header-user-sales');

        if (!tierBadge || !salesDisplay) return;

        let tier = 'Bronze';
        let tierClass = 'tier-bronze';
        let tierIcon = 'workspace_premium';

        if (currentUser.sales_total >= 15000) {
            tier = 'Ouro';
            tierClass = 'tier-ouro';
            tierIcon = 'stars';
        } else if (currentUser.sales_total >= 5000) {
            tier = 'Prata';
            tierClass = 'tier-prata';
            tierIcon = 'military_tech';
        }

        tierBadge.className = `flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-500 ${tierClass}`;
        tierName.innerText = tier;
        tierBadge.querySelector('.material-symbols-outlined').innerText = tierIcon;
        salesDisplay.innerText = `R$ ${currentUser.sales_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    function filterDataBySeller() {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowSellerId = row.getAttribute('data-seller-id');
            if (currentUser.role === 'admin') {
                row.classList.remove('hidden');
            } else {
                if (rowSellerId && rowSellerId !== currentUser.id) {
                    row.classList.add('hidden');
                } else {
                    row.classList.remove('hidden');
                }
            }
        });

        // Update Dashboard Stats Simulation
        const statsComissao = document.getElementById('stats-comissao');
        if (statsComissao) {
            statsComissao.innerText = currentUser.role === 'admin' ? 'R$ 4.250,80' : 'R$ 1.240,50';
        }

        // Adjust sales_total for simulation
        if (currentUser.role === 'admin') {
            currentUser.sales_total = 25480.00;
        } else {
            currentUser.sales_total = 8450.00;
        }
        updateGamificationUI();
    }

    function renderAvatar(url, name, size = 'size-9') {
        if (url) {
            return `<div class="${size} rounded-full bg-slate-200 bg-cover bg-center border border-white shadow-sm flex-shrink-0" style="background-image: url('${url}')"></div>`;
        }
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return `<div class="${size} bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs border border-white shadow-sm flex-shrink-0">
            ${initials}
        </div>`;
    }

    function updateSellerUI() {
        const sellerNameElements = document.querySelectorAll('.current-seller-name');
        sellerNameElements.forEach(el => el.innerText = currentUser.name);

        const avatarContainers = document.querySelectorAll('.sidebar-user-avatar');
        avatarContainers.forEach(container => {
            container.innerHTML = renderAvatar(currentUser.avatar, currentUser.name, 'size-9');
        });

        const headerAvatar = document.querySelector('.header-user-avatar');
        if (headerAvatar) {
            headerAvatar.innerHTML = renderAvatar(currentUser.avatar, currentUser.name, 'size-8');
        }

        const profileAvatarContainer = document.getElementById('profile-avatar-container');
        if (profileAvatarContainer) {
            profileAvatarContainer.innerHTML = renderAvatar(currentUser.avatar, currentUser.name, 'size-full rounded-2xl');
        }

        updateGamificationUI();
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            updateMotivationalMessage();
            updateDashboardStats();
            renderDashboardOpportunities();
        }
    }
    updateSellerUI();
    setTimeout(filterDataBySeller, 500);

    // --- Dashboard Refactoring Logic ---
    function updateMotivationalMessage() {
        const greeting = document.getElementById('dashboard-motivational');
        if (!greeting) return;

        const messages = [
            "O sucesso é a soma de pequenos esforços repetidos dia após dia. Que tal transformar leads em conquistas hoje?",
            "Venda é confiança e solução. Mostre ao seu cliente como o certificado Delta facilita a vida dele!",
            "Cada minuto de foco hoje é um passo a mais para o topo do ranking Ouro. Vamos pra cima!",
            "A persistência é o caminho do êxito. Revise seus leads quentes, a próxima grande venda está lá!",
            "Transforme 'não' em 'como podemos fazer'. Sua expertise é o que faz a diferença na Delta."
        ];

        // Random message based on day
        const dayIndex = new Date().getDate() % messages.length;
        greeting.innerText = messages[dayIndex];
    }

    async function updateDashboardStats() {
        const statsComissao = document.getElementById('stats-comissao');
        if (!statsComissao) return;

        try {
            const { stats } = await API.getFinancials();
            statsComissao.innerText = formatCurrency(stats.available || 0);

            // Note: Other stats like Sales Volume and Active Certs could be fetched here too
            // for now they remain as part of the initial simulation/API response
        } catch (error) {
            console.error('Erro ao atualizar stats do dashboard:', error);
        }
    }

    async function renderDashboardOpportunities() {
        const feed = document.getElementById('dashboard-opportunities-feed');
        if (!feed) return;

        try {
            const customers = await API.getCustomers();
            // Filter: No certificate OR expiring in < 7 days
            const today = new Date();
            const opportunities = customers.filter(c => {
                const isSeller = c.seller_id === currentUser.id || currentUser.role === 'admin';
                if (!isSeller) return false;

                if (!c.has_certificate || !c.certificate_expiration) return true;

                const expDate = new Date(c.certificate_expiration);
                const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            }).slice(0, 5); // Show top 5

            if (opportunities.length === 0) {
                feed.innerHTML = `
                    <div class="p-10 text-center text-slate-400">
                        <span class="material-symbols-outlined text-4xl mb-2 opacity-20">sentiment_satisfied</span>
                        <p class="text-sm">Tudo em dia! Sem oportunidades urgentes no momento.</p>
                    </div>
                `;
                return;
            }

            feed.innerHTML = opportunities.map(opp => {
                const isLead = !opp.has_certificate;
                const badge = isLead ?
                    '<span class="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-blue-100 text-blue-600 uppercase">Novo Lead</span>' :
                    '<span class="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-amber-100 text-amber-600 uppercase">Expira em breve</span>';

                return `
                    <div class="opportunity-row p-4 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between transition-all group">
                        <div class="flex items-center gap-3">
                            <div class="size-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <span class="material-symbols-outlined text-lg">${isLead ? 'person_add' : 'running_with_errors'}</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <p class="text-[11px] font-black text-slate-900 dark:text-white">${opp.name}</p>
                                    ${badge}
                                </div>
                                <p class="text-[10px] text-slate-400">${opp.phone || opp.email}</p>
                            </div>
                        </div>
                        <button onclick="window.generateOrderFromLead('${opp.id}')" 
                            class="size-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                            <span class="material-symbols-outlined text-sm">rocket</span>
                        </button>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Erro ao carregar oportunidades do dashboard:', error);
            feed.innerHTML = `<div class="p-6 text-center text-red-400 text-xs">Falha ao carregar oportunidades.</div>`;
        }
    }

    // Modal & Stepper Elements
    const modal = document.getElementById('modalNewOrder');
    const btnNew = document.getElementById('btnNewCertificate');
    const stepperProgress = document.getElementById('stepper-progress');
    const stepDots = document.querySelectorAll('.step-dot');
    const stepContents = document.querySelectorAll('.step-content');

    // Buttons
    const btnPrev = document.getElementById('btnPrevStep');
    const btnNext = document.getElementById('btnNextStep');
    const btnConfirm = document.getElementById('btnConfirmOrder');

    // Form Fields
    const selectPerson = document.getElementById('personType');
    const selectAttendance = document.getElementById('attendanceType');
    const selectCert = document.getElementById('certType');
    const inputPrice = document.getElementById('salePrice');
    const displayCommission = document.getElementById('commissionDisplay');
    const inputDocType = document.getElementById('docType');
    const inputDoc = document.getElementById('customerDoc');
    const rgContainer = document.getElementById('rgContainer');

    let currentStep = 1;

    // --- Product Filtering Logic ---
    function filterProducts() {
        if (!selectPerson || !selectCert) return;
        const type = selectPerson.value;
        const options = selectCert.querySelectorAll('option');

        let firstVisible = null;
        options.forEach(opt => {
            if (!opt.value) return; // Keep the placeholder
            const optType = opt.dataset.type;
            if (optType === type) {
                opt.style.display = 'block';
                if (!firstVisible) firstVisible = opt;
            } else {
                opt.style.display = 'none';
            }
        });

        // Auto-select first available if current is hidden
        const currentSelected = selectCert.options[selectCert.selectedIndex];
        if (currentSelected && currentSelected.style.display === 'none') {
            selectCert.value = "";
        }

        // Dynamic Doc Type update in Step 2 based on PF/PJ
        if (inputDocType) {
            inputDocType.value = (type === 'PF' ? 'CPF' : 'CNPJ');
            inputDocType.dispatchEvent(new Event('change'));
        }

        calculateCommission();
    }

    if (selectPerson) selectPerson.onchange = filterProducts;
    filterProducts(); // Initial filter

    if (btnNew && modal) {
        btnNew.onclick = () => {
            resetModal();
            modal.classList.remove('hidden');
        };
    }

    window.closeModal = function () {
        if (modal) modal.classList.add('hidden');
    };

    window.resetModal = function () {
        currentStep = 1;
        updateStepperUI();
        if (selectPerson) selectPerson.value = "PF";

        // Clear Step 2 & 3 fields
        ['customerName', 'customerDoc', 'customerRG', 'customerEmail', 'customerDDD', 'customerPhone', 'customerCEP', 'customerCity', 'customerAddress'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        filterProducts();
    };

    function updateStepperUI() {
        // Synchronize Attendance Type to Step 4 if needed
        const finalAttendance = document.getElementById('issueType');
        if (selectAttendance && finalAttendance) {
            finalAttendance.value = selectAttendance.value;
        }

        // Update Steps Visibility
        stepContents.forEach((content, index) => {
            content.classList.toggle('hidden', (index + 1) !== currentStep);
        });

        // Update Dots
        stepDots.forEach((dot, index) => {
            const stepNum = index + 1;
            dot.classList.toggle('active', stepNum === currentStep);
            dot.classList.toggle('bg-primary', stepNum <= currentStep);
            dot.classList.toggle('text-white', stepNum <= currentStep);
            dot.classList.toggle('bg-slate-100', stepNum > currentStep);
        });

        // Update Progress Bar
        const progress = ((currentStep - 1) / (stepDots.length - 1)) * 100;
        stepperProgress.style.width = `${progress}%`;

        // Update Buttons
        btnPrev.classList.toggle('hidden', currentStep === 1);
        btnNext.classList.toggle('hidden', currentStep === 4);
        btnConfirm.classList.toggle('hidden', currentStep !== 4);
    }

    function validateCurrentStep() {
        if (currentStep === 1) {
            if (!selectCert.value) { alert('Selecione um tipo de certificado.'); return false; }
            if (!inputPrice.value || inputPrice.value <= 0) { alert('Informe um preço de venda válido.'); return false; }

            // Commission rule: No negative commission
            const cert = selectCert.options[selectCert.selectedIndex];
            const cost = parseFloat(cert.dataset.cost);
            const price = parseFloat(inputPrice.value) || 0;
            const commission = price - cost - (price * 0.06);
            if (commission < 0) {
                alert('O preço de venda não pode ser inferior ao custo operacional (Comissão negativa não permitida).');
                return false;
            }
        }
        if (currentStep === 2) {
            const name = document.getElementById('customerName').value;
            const doc = document.getElementById('customerDoc').value;
            if (!name) { alert('Informe o nome completo.'); return false; }
            if (!doc) { alert('Informe o número do documento.'); return false; }
        }
        if (currentStep === 3) {
            const email = document.getElementById('customerEmail').value;
            const phone = document.getElementById('customerPhone').value;
            if (!email || !email.includes('@')) { alert('Informe um e-mail válido.'); return false; }
            if (!phone) { alert('Informe o número do celular.'); return false; }
        }
        return true;
    }

    if (btnNext) btnNext.onclick = () => { if (validateCurrentStep()) { currentStep++; updateStepperUI(); } };

    if (btnPrev) btnPrev.onclick = () => { currentStep--; updateStepperUI(); };

    // Commission Calculation (Business Rule: Value - Cost - 6% tax)
    function calculateCommission() {
        if (!selectCert || !inputPrice || !displayCommission) return;
        const cert = selectCert.options[selectCert.selectedIndex];
        if (!cert || cert.disabled || !cert.value) {
            displayCommission.innerText = 'R$ 0,00';
            return;
        }

        const cost = parseFloat(cert.dataset.cost);
        const price = parseFloat(inputPrice.value) || 0;

        if (price > 0) {
            const commission = price - cost - (price * 0.06);
            displayCommission.innerText = `R$ ${commission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            displayCommission.classList.toggle('text-red-500', commission < 0);
            displayCommission.classList.toggle('text-primary', commission >= 0);
        } else {
            displayCommission.innerText = 'R$ 0,00';
        }
    }

    if (selectCert) selectCert.onchange = calculateCommission;
    if (inputPrice) inputPrice.oninput = calculateCommission;

    // Doc Type RG Logic
    if (inputDocType) {
        inputDocType.onchange = () => {
            if (rgContainer) rgContainer.classList.toggle('hidden', inputDocType.value === 'CNPJ');
        };
    }

    // --- API Integration with Node.js Backend ---
    const API = {
        async createSale(data) {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        },
        async getAvailableTimes(date) {
            const response = await fetch('/api/public/horarios');
            return await response.json();
        },
        async getSales() {
            const response = await fetch(`/api/sales?seller_id=${currentUser.id}&role=${currentUser.role}`);
            return await response.json();
        },
        async getCustomers() {
            const response = await fetch(`/api/customers?seller_id=${currentUser.id}&role=${currentUser.role}`);
            return await response.json();
        },
        async createCustomer(data) {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, seller_id: currentUser.id })
            });
            return await response.json();
        },
        async updateCustomer(id, data) {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        },
        async getProfile() {
            const response = await fetch('/api/me');
            return await response.json();
        },
        async updateProfile(data) {
            const response = await fetch('/api/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        },
        async getFinancials() {
            const resStats = await fetch('/api/finance/stats');
            const stats = await resStats.json();
            const resHistory = await fetch('/api/finance/history');
            const history = await resHistory.json();
            return { stats, history };
        },
        async requestWithdrawal(amount) {
            const response = await fetch('/api/finance/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            return await response.json();
        }
    };

    window.saveOrder = async function () {
        const btn = document.getElementById('btnConfirmOrder');
        const originalText = btn.innerText;

        try {
            btn.disabled = true;
            btn.innerText = 'Processando na API...';

            const payload = {
                venda: {
                    valor_total: parseFloat(inputPrice.value),
                    produto_id: selectCert.options[selectCert.selectedIndex].dataset.id,
                    vendedor_id: currentUser.id, // Isolamento de Vendedor
                    revendedor_master: 'DELTA_ESTRATEGISTA'
                },
                certificado: {
                    nome: document.getElementById('customerName').value,
                    documento: document.getElementById('customerDoc').value,
                    documento_tipo: inputDocType.value,
                    rg: document.getElementById('customerRG').value,
                    emails: [document.getElementById('customerEmail').value],
                    celular: {
                        codigo_area: document.getElementById('customerDDD').value,
                        numero: document.getElementById('customerPhone').value
                    }
                }
            };

            const response = await API.createSale(payload);

            if (response.success) {
                alert(`Sucesso! Pedido #${response.data.id} gerado.\n\nVendedor: ${currentUser.name}\nEste pedido está isolado para sua conta.`);
                closeModal();
                loadSalesData(); // Reload table
            }
        } catch (error) {
            alert('Erro na integração. Verifique os dados.');
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    };

    let mockCertificates = [];
    async function loadSalesData() {
        try {
            mockCertificates = await API.getSales();
            renderSalesTable();
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        }
    }

    function renderSalesTable() {
        const tbody = document.getElementById('certTableBody');
        if (!tbody) return;

        // Save original HTML for filter switching
        if (!originalCertTableHTML) {
            // Will be set by filter logic below if exists
        }

        if (mockCertificates.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">Nenhuma venda encontrada.</td></tr>`;
            return;
        }

        tbody.dataset.view = 'orders';
        tbody.innerHTML = mockCertificates.map(sale => {
            const isPJ = sale.doc && sale.doc.replace(/\D/g, '').length > 11;
            const entityIcon = isPJ ? 'business' : 'person';
            const entityColor = isPJ ? 'blue' : 'emerald';

            const statusColors = {
                amber: 'text-amber-600',
                emerald: 'text-emerald-600',
                rose: 'text-rose-600',
                blue: 'text-blue-600'
            };
            const statusDots = {
                amber: 'bg-amber-500',
                emerald: 'bg-emerald-500',
                rose: 'bg-rose-500',
                blue: 'bg-blue-500'
            };

            return `
            <tr class="table-row-hover transition-all duration-200" data-seller-id="${sale.seller_id}">
                <td class="px-4 py-3">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-900 dark:text-white">#${sale.id}</span>
                        <span class="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">${sale.protocol}</span>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                        <div class="size-7 bg-${entityColor}-50 dark:bg-${entityColor}-900/20 rounded-lg flex items-center justify-center text-${entityColor}-500">
                            <span class="material-symbols-outlined text-sm">${entityIcon}</span>
                        </div>
                        <div>
                            <p class="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">${sale.holder}</p>
                            <p class="text-[10px] text-slate-500">${sale.product}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    ${renderExpirationBadge(sale.expiration_date)}
                </td>
                <td class="px-4 py-3">
                    <div class="flex flex-col gap-1">
                        <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">${sale.seller}</span>
                        ${renderSourceBadge(sale.source)}
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-1.5">
                        <span class="size-1.5 rounded-full ${statusDots[sale.statusColor] || 'bg-slate-400'}"></span>
                        <span class="text-[10px] font-bold ${statusColors[sale.statusColor] || 'text-slate-600'} uppercase tracking-tight">${sale.status}</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-[10px] font-medium text-slate-500">
                    ${sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td class="px-4 py-3 text-right">
                    <div class="flex justify-end gap-1">
                        ${sale.status === 'Pendente' ? `<button title="Agendamento" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all btn-hover-effect"><span class="material-symbols-outlined text-base">event_available</span></button>` : ''}
                        ${sale.status === 'Pago' ? `<button title="Recibo" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all btn-hover-effect"><span class="material-symbols-outlined text-base">print</span></button>` : ''}
                        ${sale.status === 'Cancelado' ? `<button title="Reativar" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all btn-hover-effect"><span class="material-symbols-outlined text-base">refresh</span></button>` : ''}
                        <button title="Ver Detalhes" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all btn-hover-effect">
                            <span class="material-symbols-outlined text-base">visibility</span>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        // Rebind actions and apply seller filter
        window.bindTableActions();
        filterDataBySeller();
    }

    function renderExpirationBadge(expStr) {
        if (!expStr || expStr === '-') {
            return `<span class="text-[10px] text-slate-400 italic">—</span>`;
        }
        const expDate = new Date(expStr);
        const today = new Date();
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        const formatted = expDate.toLocaleDateString('pt-BR');

        if (diffDays < 0) {
            return `<div class="flex flex-col gap-0.5">
                <span class="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-red-100 text-red-700 w-fit uppercase">Vencido</span>
                <span class="text-[9px] text-red-500 font-bold">${formatted}</span>
            </div>`;
        } else if (diffDays <= 30) {
            return `<div class="flex flex-col gap-0.5">
                <span class="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-amber-100 text-amber-700 w-fit uppercase animate-pulse">Vence em ${diffDays}d</span>
                <span class="text-[9px] text-amber-600 font-bold">${formatted}</span>
            </div>`;
        } else {
            return `<div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">${formatted}</span>
                <span class="text-[9px] text-emerald-500 font-bold">Em dia (${diffDays}d)</span>
            </div>`;
        }
    }

    function renderSourceBadge(source) {
        const sources = {
            manual: { icon: 'edit_note', label: 'Manual', color: 'slate' },
            plataforma: { icon: 'computer', label: 'Plataforma', color: 'blue' },
            marketing: { icon: 'campaign', label: 'Marketing', color: 'violet' },
            link_venda: { icon: 'link', label: 'Link Venda', color: 'primary' },
            renovacao: { icon: 'autorenew', label: 'Renovação', color: 'emerald' }
        };
        const s = sources[source] || sources.manual;
        const colorMap = {
            slate: 'bg-slate-100 text-slate-500',
            blue: 'bg-blue-100 text-blue-600',
            violet: 'bg-violet-100 text-violet-600',
            primary: 'bg-primary/10 text-primary',
            emerald: 'bg-emerald-100 text-emerald-600'
        };
        const cls = colorMap[s.color] || colorMap.slate;
        return `<span class="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase w-fit ${cls}">
            <span class="material-symbols-outlined text-[10px]">${s.icon}</span>${s.label}
        </span>`;
    }

    let customerBase = [];
    async function loadCustomerData() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        try {
            customerBase = await API.getCustomers();
            renderCustomersTable();
            updateCustomerStats();
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    function renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        if (customerBase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 text-sm">Nenhum cliente encontrado.</td></tr>`;
            return;
        }

        tbody.innerHTML = customerBase.map(cust => `
            <tr class="table-row-hover border-b border-slate-100 dark:border-slate-800 transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                        ${renderAvatar(cust.avatar, cust.name, 'size-8')}
                        <div>
                            <p class="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">${cust.name}</p>
                            <p class="text-[10px] text-slate-500">${cust.doc}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex flex-col">
                        <span class="text-[11px] font-medium text-slate-700 dark:text-slate-300">${cust.email}</span>
                        <span class="text-[10px] text-slate-500">${cust.phone}</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-xs font-bold text-slate-500">${cust.last_purchase ? new Date(cust.last_purchase).toLocaleDateString('pt-BR') : 'Sem compras'}</td>
                <td class="px-4 py-3">
                    ${renderCertificateStatus(cust)}
                </td>
                <td class="px-4 py-3 font-black text-slate-900 dark:text-white">R$ ${(cust.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="px-4 py-3 text-right">
                    <div class="flex justify-end gap-1">
                        <button onclick="window.generateOrderFromLead('${cust.id}')" title="Gerar Pedido" class="size-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                            <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
                        </button>
                        <button onclick="alert('Histórico de ${cust.name}')" title="Histórico" class="size-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-lg">history</span>
                        </button>
                        <button onclick="window.openCustomerModal('${cust.id}')" title="Editar" class="size-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function updateCustomerStats() {
        const totalEl = document.getElementById('stats-total-customers');
        const ltvEl = document.getElementById('stats-avg-ltv');
        const newEl = document.getElementById('stats-new-customers');

        if (!totalEl) return;

        const total = customerBase.length;
        const totalLtv = customerBase.reduce((acc, c) => acc + c.total_spent, 0);
        const avgLtv = total > 0 ? totalLtv / total : 0;

        totalEl.innerText = total;
        ltvEl.innerText = `R$ ${avgLtv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        newEl.innerText = total > 2 ? '2' : total; // Mock for "New in 30 days"
    }

    window.filterCustomersTable = function () {
        const query = document.getElementById('customerSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#customersTableBody tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.classList.toggle('hidden', !text.includes(query));
        });
    };

    function renderCertificateStatus(c) {
        if (!c.has_certificate || !c.certificate_expiration) {
            return `<span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">Oportunidade</span>`;
        }

        const expDate = new Date(c.certificate_expiration);
        const today = new Date();
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `
                <div class="flex flex-col gap-1">
                    <span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-700 w-fit">Vencido</span>
                    <span class="text-[9px] text-red-500 font-bold">${c.certificate_expiration}</span>
                </div>
            `;
        } else if (diffDays <= 30) {
            return `
                <div class="flex flex-col gap-1">
                    <span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-700 w-fit animate-pulse">Renovação</span>
                    <span class="text-[9px] text-amber-600 font-bold">${c.certificate_expiration} (${diffDays} dias)</span>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col gap-1">
                    <span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 w-fit">Ativo</span>
                    <span class="text-[9px] text-slate-500">${c.certificate_expiration}</span>
                </div>
            `;
        }
    }

    // --- Customer CRUD Handlers ---
    window.openCustomerModal = async function (customerId = null) {
        const modal = document.getElementById('modalCustomer');
        const form = document.getElementById('customerForm');
        const title = document.getElementById('customerModalTitle');

        form.reset();
        document.getElementById('cust-id').value = '';
        title.innerText = customerId ? 'Editar Lead / Cliente' : 'Novo Lead / Cliente';

        // Ensure expiration field is hidden by default for new leads
        toggleCertExpirationField(false);

        if (customerId) {
            try {
                const customers = await API.getCustomers();
                const customer = customers.find(c => c.id === customerId);
                if (customer) {
                    document.getElementById('cust-id').value = customer.id;
                    document.getElementById('cust-name').value = customer.name;
                    document.getElementById('cust-doc').value = customer.doc;
                    document.getElementById('cust-email').value = customer.email;
                    document.getElementById('cust-phone').value = customer.phone;
                    document.getElementById('cust-avatar').value = customer.avatar || '';

                    // Preview avatar
                    const preview = document.getElementById('cust-avatar-preview');
                    if (preview) {
                        preview.innerHTML = renderAvatar(customer.avatar, customer.name, 'size-full');
                    }

                    const hasCert = !!customer.has_certificate;
                    document.getElementById('cust-has-cert').checked = hasCert;
                    document.getElementById('cust-expiration').value = customer.certificate_expiration || '';
                    toggleCertExpirationField(hasCert);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do cliente:', error);
            }
        } else {
            // Default avatar for new customers
            const preview = document.getElementById('cust-avatar-preview');
            if (preview) {
                preview.innerHTML = `<span class="material-symbols-outlined text-slate-300 text-3xl">person</span>`;
            }
        }

        modal.classList.remove('hidden');
    };

    window.closeCustomerModal = function () {
        const modal = document.getElementById('modalCustomer');
        if (modal) modal.classList.add('hidden');
    };

    window.toggleCertExpirationField = function (forceState) {
        const hasCert = forceState !== undefined ? forceState : document.getElementById('cust-has-cert').checked;
        const container = document.getElementById('cert-expiration-container');
        if (container) {
            container.classList.toggle('hidden', !hasCert);
            if (!hasCert) {
                document.getElementById('cust-expiration').value = '';
            }
        }
    };

    window.saveCustomer = async function (event) {
        event.preventDefault();
        const customerId = document.getElementById('cust-id').value;
        const data = {
            name: document.getElementById('cust-name').value,
            doc: document.getElementById('cust-doc').value,
            email: document.getElementById('cust-email').value,
            phone: document.getElementById('cust-phone').value,
            seller_id: currentUser.id,
            has_certificate: document.getElementById('cust-has-cert').checked,
            certificate_expiration: document.getElementById('cust-expiration').value || null,
            avatar: document.getElementById('cust-avatar').value || null
        };

        try {
            let res;
            if (customerId) {
                res = await API.updateCustomer(customerId, data);
            } else {
                res = await API.createCustomer(data);
            }

            if (res.success) {
                showNotification(customerId ? 'Cliente atualizado!' : 'Lead cadastrado com sucesso!');
                closeCustomerModal();
                loadCustomerData();
            }
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao processar solicitação.');
        }
    };

    // Placeholder notification helper
    function showNotification(msg) {
        // We can just use alert for now or implement a toast later
        console.log('Notification:', msg);
        alert(msg);
    }

    loadSalesData();
    loadCustomerData();

    // --- Profile & Settings Logic ---
    async function initUserProfile() {
        try {
            const profile = await API.getProfile();
            currentUser = { ...currentUser, ...profile };
            updateSellerUI();

            // Set Dark Mode initial state from profile
            if (currentUser.preferences?.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
        }
    }

    window.loadSettingsData = async function () {
        if (!document.getElementById('prof-name')) return;

        try {
            const profile = await API.getProfile();
            document.getElementById('prof-name').value = profile.name || '';
            document.getElementById('prof-email').value = profile.email || '';
            document.getElementById('prof-phone').value = profile.phone || '';
            if (document.getElementById('prof-pix-key')) {
                document.getElementById('prof-pix-key').value = profile.pix_key || '';
            }

            // Fiscal Data
            if (document.getElementById('fisc-legal-name') && profile.fiscal_data) {
                document.getElementById('fisc-legal-name').value = profile.fiscal_data.legal_name || '';
                document.getElementById('fisc-doc').value = profile.fiscal_data.doc || '';
                document.getElementById('fisc-email').value = profile.email || '';
                document.getElementById('fisc-address').value = profile.fiscal_data.address || '';
                document.getElementById('fisc-accounting').value = profile.fiscal_data.accounting_info || '';
            }
        } catch (error) {
            console.error('Erro ao carregar dados de configuração:', error);
        }
    };

    window.handleProfileUpdate = async function (event) {
        event.preventDefault();
        const data = {
            name: document.getElementById('prof-name').value,
            email: document.getElementById('prof-email').value,
            phone: document.getElementById('prof-phone').value,
            pix_key: document.getElementById('prof-pix-key').value
        };

        try {
            const res = await API.updateProfile(data);
            if (res.success) {
                currentUser.name = res.data.name;
                currentUser.pix_key = res.data.pix_key;
                updateSellerUI();
                showNotification('Perfil atualizado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao salvar perfil.');
        }
    };

    window.handleFiscalUpdate = async function (event) {
        event.preventDefault();
        const data = {
            fiscal_data: {
                legal_name: document.getElementById('fisc-legal-name').value,
                doc: document.getElementById('fisc-doc').value,
                address: document.getElementById('fisc-address').value,
                accounting_info: document.getElementById('fisc-accounting').value
            }
        };

        try {
            const res = await API.updateProfile(data);
            if (res.success) {
                showNotification('Dados fiscais atualizados!');
            }
        } catch (error) {
            console.error('Erro ao atualizar dados fiscais:', error);
            alert('Erro ao salvar dados fiscais.');
        }
    };

    // --- Financial Logic ---
    window.loadFinancialData = async function () {
        try {
            const { stats, history } = await API.getFinancials();

            // Update Cards
            if (document.getElementById('fin-available')) {
                document.getElementById('fin-available').innerText = formatCurrency(stats.available);
                document.getElementById('fin-pending').innerText = formatCurrency(stats.pending);
                document.getElementById('fin-withdrawn').innerText = formatCurrency(stats.withdrawn);
            }

            // Update Header (global sync)
            if (document.getElementById('header-user-sales')) {
                document.getElementById('header-user-sales').innerText = formatCurrency(stats.available);
            }

            // Update Table
            const tbody = document.getElementById('financeHistoryBody');
            if (tbody) {
                tbody.innerHTML = history.length ? history.map(tx => `
                    <tr>
                        <td class="px-6 py-4 text-xs font-bold text-slate-500">${tx.date}</td>
                        <td class="px-6 py-4">
                            <p class="text-sm font-bold text-slate-900 dark:text-white">${tx.description}</p>
                            <p class="text-[10px] text-slate-400">ID: ${tx.id}</p>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-[10px] font-bold uppercase ${tx.type === 'commission' ? 'text-emerald-500' : 'text-primary'}">${tx.type === 'commission' ? 'Comissão' : 'Saque'}</span>
                        </td>
                        <td class="px-6 py-4 text-right font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}">
                            ${tx.amount > 0 ? '+' : ''}${formatCurrency(tx.amount)}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-2 py-1 rounded-full text-[9px] font-bold uppercase ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                                ${tx.status === 'completed' ? 'Concluído' : 'Pendente'}
                            </span>
                        </td>
                    </tr>
                `).join('') : '<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 text-sm">Nenhuma movimentação encontrada.</td></tr>';
            }

            // PIX in Modal
            if (document.getElementById('withdraw-pix-key')) {
                const profile = await API.getProfile();
                document.getElementById('withdraw-pix-key').innerText = profile.pix_key || 'Não cadastrada';
            }

        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error);
        }
    };

    window.openWithdrawModal = function () {
        document.getElementById('modalWithdraw')?.classList.remove('hidden');
    };

    window.closeWithdrawModal = function () {
        document.getElementById('modalWithdraw')?.classList.add('hidden');
    };

    window.handleWithdrawSubmit = async function () {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        if (!amount || amount < 50) {
            alert('O valor mínimo para resgate é R$ 50,00.');
            return;
        }

        try {
            const res = await API.requestWithdrawal(amount);
            if (res.success) {
                showNotification('Saque solicitado com sucesso!', 'success');
                closeWithdrawModal();
                loadFinancialData();
            } else {
                alert(res.message || 'Erro ao processar saque.');
            }
        } catch (error) {
            console.error('Erro ao solicitar saque:', error);
        }
    };

    function formatCurrency(val) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }

    window.toggleDarkMode = async function () {
        const isDark = document.documentElement.classList.toggle('dark');
        try {
            await API.updateProfile({
                preferences: { ...currentUser.preferences, darkMode: isDark }
            });
            currentUser.preferences.darkMode = isDark;
            showNotification(isDark ? 'Modo escuro ativado' : 'Modo claro ativado');
        } catch (error) {
            console.error('Erro ao salvar preferência de tema:', error);
        }
    };

    initUserProfile();

    // --- Action Handlers ---
    window.agilizarPedido = async function (ref) {
        const btn = event.currentTarget;
        const originalContent = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Processando...';

        await new Promise(resolve => setTimeout(resolve, 1500));

        btn.innerHTML = '<span class="material-symbols-outlined text-emerald-500">check_circle</span> Enviado!';
        showToast(`Solicitação de agilização para ${ref} enviada com sucesso para a certificadora.`);

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 3000);
    };

    window.showCertificateDetails = function (id) {
        const numId = parseInt(id);
        const cert = mockCertificates.find(c => c.id === numId || c.id === id) || mockCertificates[0];
        const modal = document.getElementById('modalCertDetails');
        if (!modal || !cert) return;

        document.getElementById('det-holder').innerText = cert.holder;
        document.getElementById('det-product').innerText = cert.product;
        document.getElementById('det-id').innerText = `#${cert.id}`;
        document.getElementById('det-protocol').innerText = cert.protocol;
        document.getElementById('det-status').innerText = cert.status;
        document.getElementById('det-status-badge').className = `text-[10px] font-bold bg-${cert.statusColor}-100 text-${cert.statusColor}-700 px-2 py-1 rounded-full uppercase`;
        document.getElementById('det-doc').innerText = cert.doc || '---';
        document.getElementById('det-email').innerText = cert.email || '---';
        document.getElementById('det-phone').innerText = cert.phone || '---';
        document.getElementById('det-date').innerText = cert.date ? new Date(cert.date).toLocaleDateString('pt-BR') : '---';

        // New fields
        const expEl = document.getElementById('det-expiration');
        if (expEl) {
            if (cert.expiration_date && cert.expiration_date !== '-') {
                const expDate = new Date(cert.expiration_date);
                const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
                expEl.innerHTML = `${expDate.toLocaleDateString('pt-BR')} <span class="text-[10px] font-bold ml-1 ${diffDays < 0 ? 'text-red-500' : diffDays <= 30 ? 'text-amber-500' : 'text-emerald-500'}">(${diffDays < 0 ? 'Vencido' : diffDays + 'd restantes'})</span>`;
            } else {
                expEl.innerText = '—';
            }
        }
        const srcEl = document.getElementById('det-source');
        const sourceLabels = { manual: '✏️ Manual', plataforma: '💻 Plataforma', marketing: '📢 Marketing', link_venda: '🔗 Link de Venda', renovacao: '🔄 Renovação' };
        if (srcEl) srcEl.innerText = sourceLabels[cert.source] || cert.source || '—';

        modal.classList.remove('hidden');
    };

    window.closeCertDetails = function () {
        const modal = document.getElementById('modalCertDetails');
        if (modal) modal.classList.add('hidden');
    };

    window.reativarPedido = function (id) {
        if (confirm(`Deseja reativar o pedido #${id}? Um novo link de pagamento será gerado.`)) {
            showToast(`Pedido #${id} reativado com sucesso.`);
        }
    };

    window.openSchedulingLink = function (id) {
        const url = 'https://service.certcontrol.com.br/agendamento/' + btoa(id);
        window.open(url, '_blank');
    };

    window.printReceipt = function (id) {
        showToast(`Gerando recibo do pedido #${id}...`);
        setTimeout(() => {
            alert('Recibo gerado com sucesso! Iniciando download...');
        }, 1000);
    };

    function showToast(message) {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all transform translate-y-20 opacity-0';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<span class="material-symbols-outlined text-primary">info</span> <span class="text-sm font-medium">${message}</span>`;
        toast.classList.remove('translate-y-20', 'opacity-0');

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 4000);
    }

    // --- Action Handlers Reusable ---
    window.bindTableActions = function () {
        // Connect Agilizar buttons
        document.querySelectorAll('button').forEach(btn => {
            if (btn.innerText.includes('Agilizar') && !btn.dataset.bound) {
                const card = btn.closest('div');
                const ref = card.querySelector('p')?.innerText || 'Pedido';
                btn.onclick = () => window.agilizarPedido(ref);
                btn.dataset.bound = "true";
            }
        });

        // Connect Table Row Actions
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            if (row.dataset.bound) return;

            const idCol = row.querySelector('td:first-child span.text-sm') || row.querySelector('td:first-child span.text-xs');
            if (!idCol) return;
            const certId = idCol.innerText.replace('#', '').trim();

            // Visibility Button
            row.querySelector('button[title="Ver Detalhes"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.showCertificateDetails(certId);
            });

            // Scheduling Button
            const schedBtn = row.querySelector('button[title="Link de Agendamento"]') || row.querySelector('button[title="Agendamento"]');
            schedBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.openSchedulingLink(certId);
            });

            // Print Button
            const printBtn = row.querySelector('button[title="Imprimir Recibo"]') || row.querySelector('button[title="Recibo"]');
            printBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.printReceipt(certId);
            });

            // Refresh/Reactivate Button
            const reactiveBtn = row.querySelector('button[title="Reativar Pedido"]') || row.querySelector('button[title="Reativar"]');
            reactiveBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.reativarPedido(certId);
            });

            row.dataset.bound = "true";
        });
    };
    window.bindTableActions();

    // --- Filter Buttons Logic (Improved) ---
    const filterContainer = document.getElementById('cert-filter-bar') ||
        document.querySelector('.flex.rounded-lg.border.border-slate-200.p-0.5.bg-white') ||
        document.querySelector('.flex.rounded-lg.border.border-slate-200.p-1.bg-white');

    let originalCertTableHTML = '';
    const certTableBody = document.getElementById('certTableBody');
    if (certTableBody) {
        originalCertTableHTML = certTableBody.innerHTML;
    }

    if (filterContainer) {
        const filterBtns = filterContainer.querySelectorAll('button');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                const status = btn.innerText.trim();
                console.log('Filtro clicado:', status);

                // Update UI active state
                filterBtns.forEach(b => {
                    b.classList.remove('bg-slate-100', 'font-bold');
                    b.classList.add('text-slate-500', 'font-medium');
                });
                btn.classList.add('bg-slate-100', 'font-bold');
                btn.classList.remove('text-slate-500', 'font-medium');

                if (status === 'Oportunidade') {
                    renderOpportunityRows();
                } else {
                    // Restore original table if we're coming from Opportunity view
                    if (certTableBody && certTableBody.dataset.view === 'opportunity') {
                        certTableBody.innerHTML = originalCertTableHTML;
                        certTableBody.dataset.view = 'orders';
                        window.bindTableActions();
                        filterDataBySeller(); // Re-apply seller isolation
                        const pagFooter = document.getElementById('cert-pagination-footer');
                        if (pagFooter) pagFooter.classList.remove('hidden');
                    }

                    // Standard Filter Logic (Toggles visibility)
                    const rows = certTableBody ? certTableBody.querySelectorAll('tr') : document.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        if (status === 'Todos') {
                            row.classList.remove('hidden-filter');
                        } else if (status === 'Expirando') {
                            row.classList.toggle('hidden-filter', !row.innerText.includes('Pendente'));
                        } else if (status === 'Expirados') {
                            row.classList.toggle('hidden-filter', !row.innerText.includes('Cancelado'));
                        }
                    });
                }
            };
        });
    }

    async function renderOpportunityRows() {
        if (!certTableBody) return;

        // Hide pagination as it doesn't apply to this dynamic view
        const pagFooter = document.getElementById('cert-pagination-footer');
        if (pagFooter) pagFooter.classList.add('hidden');

        certTableBody.dataset.view = 'opportunity';
        certTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 text-sm"><span class="animate-pulse">Buscando oportunidades na sua base...</span></td></tr>`;

        try {
            const customers = await API.getCustomers();
            const opportunities = customers.filter(c => !c.has_certificate || isExpiredOrNear(c.certificate_expiration));

            if (opportunities.length === 0) {
                certTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 text-sm">Nenhuma oportunidade encontrada no momento.</td></tr>`;
                return;
            }

            certTableBody.innerHTML = opportunities.map(c => `
                <tr class="table-row-hover transition-all duration-200">
                    <td class="px-4 py-3">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit uppercase border border-primary/20">Lead</span>
                            <span class="text-[9px] text-slate-400 font-mono tracking-tighter uppercase mt-1">ID: ${c.id}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2.5">
                            <div class="size-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                <span class="material-symbols-outlined text-sm">business</span>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">${c.name}</p>
                                <p class="text-[10px] text-slate-500">Documento: ${c.doc}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">${c.email}</span>
                            <span class="text-[9px] text-slate-400 uppercase tracking-tighter">${c.phone}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-1.5">
                            ${renderOpportunityBadge(c)}
                        </div>
                    </td>
                    <td class="px-4 py-3 text-[10px] font-medium text-slate-400 italic">
                        Não adquirido via Delta
                    </td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex justify-end gap-1">
                            <button onclick="window.generateOrderFromLead('${c.id}')" title="Gerar Pedido Direto" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                <span class="material-symbols-outlined text-base">add_shopping_cart</span>
                            </button>
                            <button onclick="window.location.href='loja.html'" title="Enviar Link de Venda" class="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-all">
                                <span class="material-symbols-outlined text-base">send</span>
                            </button>
                            <button onclick="window.location.href='clientes.html'" title="Ver Cliente" class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                <span class="material-symbols-outlined text-base">open_in_new</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar oportunidades:', error);
            certTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-400 text-sm">Erro ao carregar oportunidades.</td></tr>`;
        }
    }

    function isExpiredOrNear(expDateStr) {
        if (!expDateStr) return true;
        const expDate = new Date(expDateStr);
        const today = new Date();
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // 30 days or already expired
    }

    function renderOpportunityBadge(c) {
        if (!c.has_certificate || !c.certificate_expiration) {
            return `<span class="size-1.5 rounded-full bg-primary"></span><span class="text-[10px] font-bold text-primary uppercase">Oportunidade</span>`;
        }
        const expDate = new Date(c.certificate_expiration);
        const today = new Date();
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return `<span class="size-1.5 rounded-full bg-red-500"></span><span class="text-[10px] font-bold text-red-600 uppercase">Expirado Externo</span>`;
        }
        return `<span class="size-1.5 rounded-full bg-amber-500 animate-pulse"></span><span class="text-[10px] font-bold text-amber-600 uppercase">Renovação Externa</span>`;
    }

    window.generateOrderFromLead = async function (leadId) {
        try {
            const customers = await API.getCustomers();
            const lead = customers.find(c => c.id === leadId);
            if (!lead) return;

            window.resetModal();

            // Pre-fill fields
            if (document.getElementById('customerName')) document.getElementById('customerName').value = lead.name;
            if (document.getElementById('customerEmail')) document.getElementById('customerEmail').value = lead.email || '';

            if (lead.phone) {
                const parts = lead.phone.replace(/\D/g, '');
                if (parts.length >= 10) {
                    if (document.getElementById('customerDDD')) document.getElementById('customerDDD').value = parts.substring(0, 2);
                    if (document.getElementById('customerPhone')) document.getElementById('customerPhone').value = parts.substring(2);
                } else {
                    if (document.getElementById('customerPhone')) document.getElementById('customerPhone').value = parts;
                }
            }

            if (lead.doc) {
                const docClean = lead.doc.replace(/\D/g, '');
                if (document.getElementById('customerDoc')) document.getElementById('customerDoc').value = docClean;
                if (document.getElementById('docType')) {
                    document.getElementById('docType').value = docClean.length > 11 ? 'CNPJ' : 'CPF';
                    document.getElementById('docType').dispatchEvent(new Event('change'));
                }
                if (document.getElementById('personType')) {
                    document.getElementById('personType').value = docClean.length > 11 ? 'PJ' : 'PF';
                    document.getElementById('personType').dispatchEvent(new Event('change'));
                }
            }

            // Open modal
            const modalOrder = document.getElementById('modalNewOrder');
            if (modalOrder) modalOrder.classList.remove('hidden');

            showToast(`Dados de ${lead.name} carregados no pedido.`);
        } catch (error) {
            console.error('Erro ao gerar pedido do lead:', error);
            alert('Erro ao carregar dados do lead.');
        }
    };

    // Sidebar Mobile Logic
    const sidebar = document.querySelector('aside');
    window.toggleSidebar = function () {
        if (sidebar) sidebar.classList.toggle('sidebar-mobile-hidden');
    };

    const navLinks = document.querySelectorAll('aside nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024 && sidebar) {
                sidebar.classList.add('sidebar-mobile-hidden');
            }
        });
    });
    // --- Avatar Management Helpers ---
    const DEMO_AVATARS = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&h=150',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150'
    ];

    window.changeProfileAvatar = async function () {
        const currentIdx = DEMO_AVATARS.indexOf(currentUser.avatar);
        const nextIdx = (currentIdx + 1) % DEMO_AVATARS.length;
        const newAvatar = DEMO_AVATARS[nextIdx];

        try {
            const res = await API.updateProfile({ avatar: newAvatar });
            if (res.success) {
                currentUser.avatar = newAvatar;
                updateSellerUI();
                showToast('Foto de perfil atualizada!');
            }
        } catch (error) {
            console.error('Erro ao mudar avatar:', error);
        }
    };

    window.changeCustomerAvatar = function () {
        const avatarInput = document.getElementById('cust-avatar');
        const currentAvatar = avatarInput.value;
        const currentIdx = DEMO_AVATARS.indexOf(currentAvatar);
        const nextIdx = (currentIdx + 1) % DEMO_AVATARS.length;
        const newAvatar = DEMO_AVATARS[nextIdx];

        avatarInput.value = newAvatar;
        const preview = document.getElementById('cust-avatar-preview');
        const custName = document.getElementById('cust-name').value || 'Cliente';
        if (preview) {
            preview.innerHTML = renderAvatar(newAvatar, custName, 'size-full');
        }
        showToast('Avatar do cliente selecionado.');
    };

    console.log('Delta Scripts: Finalizado carregamento do DOM.');
});

