/* ============================================
   DASHBOARD ANALYTICS PRO - SCRIPTS
   ============================================ */

// ============================================
// ANIMATION DES COMPTEURS
// ============================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function pour animation fluide
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (target - start) * easeOutQuart;
            
            // Formatage selon le type de valeur
            if (target % 1 !== 0) {
                counter.textContent = current.toFixed(1);
            } else if (target >= 1000) {
                counter.textContent = Math.floor(current).toLocaleString('fr-FR');
            } else {
                counter.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

// ============================================
// TOGGLE THEME (CLAIR/SOMBRE)
// ============================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Vérifier le thème sauvegardé
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('dashboard-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Mettre à jour les graphiques pour le nouveau thème
        updateChartsTheme(newTheme);
    });
}

// ============================================
// GRAPHIQUE DES REVENUS
// ============================================

let revenueChart, trafficChart;

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: CONFIG.revenueChart.labels,
            datasets: [{
                label: CONFIG.revenueChart.label,
                data: CONFIG.revenueChart.data,
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#1e293b',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b'
                    }
                },
                y: {
                    grid: {
                        color: isDark ? '#334155' : '#e2e8f0'
                    },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Fixer la hauteur du canvas
    document.getElementById('revenueChart').parentElement.style.height = '300px';
}

// ============================================
// GRAPHIQUE DU TRAFIC (DOUGHNUT)
// ============================================

function initTrafficChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    trafficChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CONFIG.trafficChart.labels,
            datasets: [{
                data: CONFIG.trafficChart.data,
                backgroundColor: CONFIG.trafficChart.colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#1e293b',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Fixer la hauteur du canvas
    document.getElementById('trafficChart').parentElement.style.height = '300px';
}

// ============================================
// MISE À JOUR DES GRAPHIQUES SELON LE THÈME
// ============================================

function updateChartsTheme(theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipTitle = isDark ? '#f1f5f9' : '#1e293b';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
    
    // Mise à jour du graphique des revenus
    if (revenueChart) {
        revenueChart.options.scales.x.ticks.color = textColor;
        revenueChart.options.scales.y.ticks.color = textColor;
        revenueChart.options.scales.y.grid.color = gridColor;
        revenueChart.options.plugins.tooltip.backgroundColor = tooltipBg;
        revenueChart.options.plugins.tooltip.titleColor = tooltipTitle;
        revenueChart.options.plugins.tooltip.bodyColor = textColor;
        revenueChart.options.plugins.tooltip.borderColor = tooltipBorder;
        revenueChart.update();
    }
    
    // Mise à jour du graphique du trafic
    if (trafficChart) {
        trafficChart.options.plugins.legend.labels.color = textColor;
        trafficChart.options.plugins.tooltip.backgroundColor = tooltipBg;
        trafficChart.options.plugins.tooltip.titleColor = tooltipTitle;
        trafficChart.options.plugins.tooltip.bodyColor = textColor;
        trafficChart.options.plugins.tooltip.borderColor = tooltipBorder;
        trafficChart.update();
    }
}

// ============================================
// NAVIGATION ACTIVE
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Retirer la classe active de tous les items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Ajouter la classe active à l'item cliqué
            item.classList.add('active');
        });
    });
}

// ============================================
// ANIMATIONS AU SCROLL
// ============================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Appliquer aux cartes
    const cards = document.querySelectorAll('.stat-card, .chart-card, .activity-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ============================================
// INITIALISATION
// ============================================



// ============================================
// DATA TABLE - DONNÉES ET FONCTIONNALITÉS
// ============================================

const ordersData = CONFIG.orders;

// Configuration
const rowsPerPage = 10;
let currentPage = 1;
let filteredData = [...ordersData];
let sortColumn = null;
let sortDirection = 'asc';

// Couleurs pour les avatars
const avatarColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'
];

function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getStatusLabel(status) {
    const labels = {
        completed: 'Terminé',
        pending: 'En attente',
        processing: 'En cours',
        cancelled: 'Annulé'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// ============================================
// RENDU DU TABLEAU
// ============================================

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);
    
    tbody.innerHTML = pageData.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>
                <div class="client-cell">
                    <div class="client-avatar" style="background: ${getAvatarColor(order.client)}">
                        ${order.client.charAt(0)}
                    </div>
                    <span class="client-name">${order.client}</span>
                </div>
            </td>
            <td>${order.product}</td>
            <td><span class="amount">${order.amount} €</span></td>
            <td>
                <span class="status-badge ${order.status}">
                    <span class="status-dot"></span>
                    ${getStatusLabel(order.status)}
                </span>
            </td>
            <td>${formatDate(order.date)}</td>
        </tr>
    `).join('');
    
    updateTableInfo();
    renderPagination();
}

// ============================================
// PAGINATION
// ============================================

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    
    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">←</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }
    
    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">→</button>
    `;
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
    }
}

function updateTableInfo() {
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, filteredData.length);
    document.getElementById('tableInfo').textContent = 
        `Affichage ${start}-${end} sur ${filteredData.length}`;
}

// ============================================
// RECHERCHE
// ============================================

function initTableSearch() {
    const searchInput = document.getElementById('tableSearch');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        filteredData = ordersData.filter(order => 
            order.id.toLowerCase().includes(query) ||
            order.client.toLowerCase().includes(query) ||
            order.product.toLowerCase().includes(query) ||
            getStatusLabel(order.status).toLowerCase().includes(query)
        );
        
        currentPage = 1;
        renderTable();
    });
}

// ============================================
// TRI
// ============================================

function initTableSort() {
    const headers = document.querySelectorAll('.data-table th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            
            // Reset autres colonnes
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Toggle direction
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            
            header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            
            // Tri des données
            filteredData.sort((a, b) => {
                let valueA = a[column];
                let valueB = b[column];
                
                // Conversion pour tri numérique
                if (column === 'amount') {
                    valueA = parseFloat(valueA);
                    valueB = parseFloat(valueB);
                }
                
                if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
            
            currentPage = 1;
            renderTable();
        });
    });
}

// ============================================
// EXPORT CSV
// ============================================

function initExport() {
    const exportBtn = document.getElementById('exportBtn');
    
    exportBtn.addEventListener('click', () => {
        const headers = ['ID', 'Client', 'Produit', 'Montant', 'Statut', 'Date'];
        const csvContent = [
            headers.join(';'),
            ...filteredData.map(order => [
                order.id,
                order.client,
                order.product,
                order.amount + ' €',
                getStatusLabel(order.status),
                formatDate(order.date)
            ].join(';'))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'commandes_export.csv';
        link.click();
        
        // Feedback visuel
        exportBtn.innerHTML = '<span>✓</span> Exporté !';
        setTimeout(() => {
            exportBtn.innerHTML = '<span>📥</span> Exporter';
        }, 2000);
    });
}

// ============================================
// INITIALISATION DU TABLEAU
// ============================================

function initDataTable() {
    renderTable();
    initTableSearch();
    initTableSort();
    initExport();
}



// ============================================
// SYSTÈME DE NOTIFICATIONS
// ============================================

const notificationsData = CONFIG.notifications.map((notif, index) => ({
    id: index + 1,
    ...notif
}));

let notifications = [...notificationsData];

// ============================================
// RENDU DES NOTIFICATIONS
// ============================================

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    
    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
            <div class="notification-icon ${notif.type}">
                ${notif.icon}
            </div>
            <div class="notification-content">
                <p class="notification-text">${notif.text}</p>
                <span class="notification-time">${notif.time}</span>
            </div>
        </div>
    `).join('');
    
    // Ajouter événements de clic
    list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.getAttribute('data-id'));
            markAsRead(id);
        });
    });
    
    updateBadge();
}

// ============================================
// GESTION DU BADGE
// ============================================

function updateBadge() {
    const badge = document.getElementById('notificationsBadge');
    const unreadCount = notifications.filter(n => n.unread).length;
    
    badge.textContent = unreadCount;
    
    if (unreadCount === 0) {
        badge.classList.add('hidden');
    } else {
        badge.classList.remove('hidden');
    }
}

// ============================================
// MARQUER COMME LU
// ============================================

function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
        notif.unread = false;
        renderNotifications();
    }
}

function markAllAsRead() {
    notifications.forEach(notif => {
        notif.unread = false;
    });
    renderNotifications();
    
    // Feedback visuel
    const btn = document.getElementById('markAllRead');
    btn.textContent = '✓ Fait !';
    setTimeout(() => {
        btn.textContent = 'Tout marquer lu';
    }, 1500);
}

// ============================================
// TOGGLE PANNEAU
// ============================================

function initNotifications() {
    const btn = document.getElementById('notificationsBtn');
    const panel = document.getElementById('notificationsPanel');
    const markAllBtn = document.getElementById('markAllRead');
    
    // Toggle panneau
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });
    
    // Fermer en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    // Marquer tout comme lu
    markAllBtn.addEventListener('click', markAllAsRead);
    
    // Rendu initial
    renderNotifications();
}

// ============================================
// SIMULER NOUVELLES NOTIFICATIONS
// ============================================

function simulateNewNotification() {
    const newNotifications = [
        {
            type: 'order',
            icon: '✓',
            text: '<strong>Nouvelle commande #1235</strong> de Lucas Martin pour 249€',
        },
        {
            type: 'user',
            icon: '👤',
            text: '<strong>Nouvel utilisateur</strong> Emma Leroy vient de s\'inscrire',
        },
        {
            type: 'review',
            icon: '⭐',
            text: '<strong>Nouvel avis 5 étoiles</strong> "Super dashboard, je recommande !"',
        }
    ];
    
    const randomNotif = newNotifications[Math.floor(Math.random() * newNotifications.length)];
    
    const newNotif = {
        id: Date.now(),
        type: randomNotif.type,
        icon: randomNotif.icon,
        text: randomNotif.text,
        time: 'À l\'instant',
        unread: true
    };
    
    notifications.unshift(newNotif);
    renderNotifications();
    
    // Animation du bouton
    const btn = document.getElementById('notificationsBtn');
    btn.style.animation = 'none';
    btn.offsetHeight; // Trigger reflow
    btn.style.animation = 'shake 0.5s ease';
}

// Animation shake pour le bouton
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: rotate(0); }
        25% { transform: rotate(-10deg); }
        50% { transform: rotate(10deg); }
        75% { transform: rotate(-10deg); }
    }
`;
document.head.appendChild(style);

// Simuler une notification toutes les 30 secondes (pour démo)
setInterval(simulateNewNotification, 30000);



// ============================================
// SYSTÈME DE PAGES (SPA)
// ============================================

const pages = {
    // ========== PAGE DASHBOARD ==========
    dashboard: `
        <!-- Toolbar Drag & Drop -->
        <div class="dashboard-toolbar">
            <span class="toolbar-hint">💡 Glissez-déposez les widgets pour personnaliser votre dashboard</span>
            <button class="reset-layout-btn" id="resetLayoutBtn">↺ Réinitialiser</button>
        </div>

        <!-- Zone de widgets draggables -->
        <div class="widgets-container" id="widgetsContainer">
            
            <!-- Widget: Stats Cards -->
            <div class="widget" draggable="true" data-widget-id="stats">
                <div class="widget-drag-handle">⋮⋮</div>
                <section class="stats-grid" id="statsGrid">
                    <!-- Stats générées dynamiquement -->
                </section>
            </div>

            <!-- Widget: Graphique Revenus -->
            <div class="widget" draggable="true" data-widget-id="revenue-chart">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="chart-card large">
                    <div class="chart-header">
                        <h3>Revenus mensuels</h3>
                        <select class="chart-filter">
                            <option>Cette année</option>
                            <option>Année dernière</option>
                        </select>
                    </div>
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <!-- Widget: Graphique Trafic -->
            <div class="widget" draggable="true" data-widget-id="traffic-chart">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Sources de trafic</h3>
                    </div>
                    <canvas id="trafficChart"></canvas>
                </div>
            </div>

            <!-- Widget: Activité récente -->
            <div class="widget" draggable="true" data-widget-id="activity">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="activity-card">
                    <div class="chart-header">
                        <h3>Activité récente</h3>
                        <a href="#" class="view-all">Voir tout →</a>
                    </div>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon green">✓</div>
                            <div class="activity-info">
                                <span class="activity-text">Nouvelle commande #1234</span>
                                <span class="activity-time">Il y a 5 min</span>
                            </div>
                            <span class="activity-amount">+79€</span>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon blue">👤</div>
                            <div class="activity-info">
                                <span class="activity-text">Nouvel utilisateur inscrit</span>
                                <span class="activity-time">Il y a 12 min</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon orange">⭐</div>
                            <div class="activity-info">
                                <span class="activity-text">Nouvel avis 5 étoiles</span>
                                <span class="activity-time">Il y a 1h</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon green">✓</div>
                            <div class="activity-info">
                                <span class="activity-text">Nouvelle commande #1233</span>
                                <span class="activity-time">Il y a 2h</span>
                            </div>
                            <span class="activity-amount">+49€</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Widget: Tableau des commandes -->
            <div class="widget full-width" draggable="true" data-widget-id="orders-table">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="table-card">
                    <div class="table-header">
                        <h3>Dernières commandes</h3>
                        <div class="table-actions">
                            <div class="search-box">
                                <span class="search-icon">🔍</span>
                                <input type="text" id="tableSearch" placeholder="Rechercher...">
                            </div>
                            <button class="export-btn" id="exportBtn">
                                <span>📥</span> Exporter
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="data-table" id="ordersTable">
                            <thead>
                                <tr>
                                    <th data-sort="id">ID <span class="sort-icon">↕</span></th>
                                    <th data-sort="client">Client <span class="sort-icon">↕</span></th>
                                    <th data-sort="product">Produit <span class="sort-icon">↕</span></th>
                                    <th data-sort="amount">Montant <span class="sort-icon">↕</span></th>
                                    <th data-sort="status">Statut <span class="sort-icon">↕</span></th>
                                    <th data-sort="date">Date <span class="sort-icon">↕</span></th>
                                </tr>
                            </thead>
                            <tbody id="tableBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="table-footer">
                        <span class="table-info" id="tableInfo">Affichage 1-10 sur 25</span>
                        <div class="pagination" id="pagination">
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,

    // ========== PAGE STATISTIQUES ==========
    statistics: `
        <section class="page-header-section">
            <h2 class="section-title">📈 Statistiques avancées</h2>
            <p class="section-subtitle">Analysez vos performances en détail</p>
        </section>

        <section class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">👁️</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="45230">0</span>
                    <span class="stat-label">Vues totales</span>
                </div>
                <span class="stat-trend positive">+18.2%</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">🎯</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="3.2">0</span>
                    <span class="stat-label">Taux conversion %</span>
                </div>
                <span class="stat-trend positive">+0.8%</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">⏱️</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="4.5">0</span>
                    <span class="stat-label">Temps moyen (min)</span>
                </div>
                <span class="stat-trend positive">+1.2</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">📉</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="23">0</span>
                    <span class="stat-label">Taux rebond %</span>
                </div>
                <span class="stat-trend positive">-5.3%</span>
            </div>
        </section>

        <section class="charts-grid">
            <div class="chart-card large">
                <div class="chart-header">
                    <h3>Visiteurs par jour</h3>
                    <select class="chart-filter" id="visitorsFilter">
                        <option value="7">7 derniers jours</option>
                        <option value="30" selected>30 derniers jours</option>
                        <option value="90">90 derniers jours</option>
                    </select>
                </div>
                <canvas id="visitorsChart"></canvas>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Appareils</h3>
                </div>
                <canvas id="devicesChart"></canvas>
            </div>
        </section>

        <section class="charts-grid" style="margin-top: 24px;">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Top pages</h3>
                </div>
                <div class="top-pages-list">
                    <div class="top-page-item">
                        <span class="page-rank">1</span>
                        <div class="page-info">
                            <span class="page-name">/dashboard</span>
                            <div class="page-bar"><div class="page-bar-fill" style="width: 85%"></div></div>
                        </div>
                        <span class="page-views">12,450</span>
                    </div>
                    <div class="top-page-item">
                        <span class="page-rank">2</span>
                        <div class="page-info">
                            <span class="page-name">/products</span>
                            <div class="page-bar"><div class="page-bar-fill" style="width: 65%"></div></div>
                        </div>
                        <span class="page-views">9,320</span>
                    </div>
                    <div class="top-page-item">
                        <span class="page-rank">3</span>
                        <div class="page-info">
                            <span class="page-name">/pricing</span>
                            <div class="page-bar"><div class="page-bar-fill" style="width: 48%"></div></div>
                        </div>
                        <span class="page-views">6,890</span>
                    </div>
                    <div class="top-page-item">
                        <span class="page-rank">4</span>
                        <div class="page-info">
                            <span class="page-name">/contact</span>
                            <div class="page-bar"><div class="page-bar-fill" style="width: 32%"></div></div>
                        </div>
                        <span class="page-views">4,560</span>
                    </div>
                    <div class="top-page-item">
                        <span class="page-rank">5</span>
                        <div class="page-info">
                            <span class="page-name">/about</span>
                            <div class="page-bar"><div class="page-bar-fill" style="width: 25%"></div></div>
                        </div>
                        <span class="page-views">3,210</span>
                    </div>
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Pays</h3>
                </div>
                <div class="countries-list">
                    <div class="country-item">
                        <span class="country-flag">🇫🇷</span>
                        <span class="country-name">France</span>
                        <span class="country-percent">45%</span>
                    </div>
                    <div class="country-item">
                        <span class="country-flag">🇧🇪</span>
                        <span class="country-name">Belgique</span>
                        <span class="country-percent">18%</span>
                    </div>
                    <div class="country-item">
                        <span class="country-flag">🇨🇭</span>
                        <span class="country-name">Suisse</span>
                        <span class="country-percent">15%</span>
                    </div>
                    <div class="country-item">
                        <span class="country-flag">🇨🇦</span>
                        <span class="country-name">Canada</span>
                        <span class="country-percent">12%</span>
                    </div>
                    <div class="country-item">
                        <span class="country-flag">🇲🇦</span>
                        <span class="country-name">Maroc</span>
                        <span class="country-percent">10%</span>
                    </div>
                </div>
            </div>
        </section>
    `,

    // ========== PAGE UTILISATEURS ==========
    users: `
        <section class="page-header-section">
            <div class="page-header-content">
                <div>
                    <h2 class="section-title">👥 Utilisateurs</h2>
                    <p class="section-subtitle">Gérez vos utilisateurs et leurs accès</p>
                </div>
                <button class="primary-btn" id="addUserBtn">
                    <span>➕</span> Ajouter un utilisateur
                </button>
            </div>
        </section>

        <section class="stats-grid four-cols">
            <div class="stat-card">
                <div class="stat-icon blue">👥</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="1284">0</span>
                    <span class="stat-label">Total utilisateurs</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">✓</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="1156">0</span>
                    <span class="stat-label">Actifs</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">🕐</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="98">0</span>
                    <span class="stat-label">En attente</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">👑</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="30">0</span>
                    <span class="stat-label">Premium</span>
                </div>
            </div>
        </section>

        <section class="table-section">
            <div class="table-card">
                <div class="table-header">
                    <h3>Liste des utilisateurs</h3>
                    <div class="table-actions">
                        <div class="search-box">
                            <span class="search-icon">🔍</span>
                            <input type="text" id="userSearch" placeholder="Rechercher un utilisateur...">
                        </div>
                        <select class="chart-filter" id="userFilter">
                            <option value="all">Tous</option>
                            <option value="active">Actifs</option>
                            <option value="pending">En attente</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Email</th>
                                <th>Plan</th>
                                <th>Statut</th>
                                <th>Inscrit le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-info" id="usersTableInfo">Affichage 1-10 sur 50</span>
                    <div class="pagination" id="usersPagination">
                    </div>
                </div>
            </div>
        </section>
    `,

    // ========== PAGE REVENUS ==========
    revenue: `
        <section class="page-header-section">
            <h2 class="section-title">💰 Revenus</h2>
            <p class="section-subtitle">Suivez vos performances financières</p>
        </section>

        <section class="stats-grid">
            <div class="stat-card highlight">
                <div class="stat-icon blue">💶</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="24580">0</span>
                    <span class="stat-label">Revenus ce mois (€)</span>
                </div>
                <span class="stat-trend positive">+12.5%</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">📈</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="156890">0</span>
                    <span class="stat-label">Revenus annuels (€)</span>
                </div>
                <span class="stat-trend positive">+28.3%</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">🎫</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="89">0</span>
                    <span class="stat-label">Panier moyen (€)</span>
                </div>
                <span class="stat-trend positive">+5.2%</span>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">🔄</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="67">0</span>
                    <span class="stat-label">Récurrence %</span>
                </div>
                <span class="stat-trend positive">+3.1%</span>
            </div>
        </section>

        <section class="charts-grid">
            <div class="chart-card large">
                <div class="chart-header">
                    <h3>Évolution des revenus</h3>
                    <div class="chart-tabs">
                        <button class="chart-tab active" data-period="month">Mois</button>
                        <button class="chart-tab" data-period="quarter">Trimestre</button>
                        <button class="chart-tab" data-period="year">Année</button>
                    </div>
                </div>
                <canvas id="revenueEvolutionChart"></canvas>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Par produit</h3>
                </div>
                <canvas id="productRevenueChart"></canvas>
            </div>
        </section>

        <section class="revenue-breakdown">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Détail par produit</h3>
                </div>
                <div class="product-revenue-list">
                    <div class="product-revenue-item">
                        <div class="product-info">
                            <div class="product-icon blue">📊</div>
                            <div>
                                <span class="product-name">Dashboard Business</span>
                                <span class="product-sales">124 ventes</span>
                            </div>
                        </div>
                        <div class="product-stats">
                            <span class="product-amount">30,876 €</span>
                            <span class="product-percent positive">42%</span>
                        </div>
                    </div>
                    <div class="product-revenue-item">
                        <div class="product-info">
                            <div class="product-icon purple">📈</div>
                            <div>
                                <span class="product-name">Dashboard Pro</span>
                                <span class="product-sales">256 ventes</span>
                            </div>
                        </div>
                        <div class="product-stats">
                            <span class="product-amount">38,144 €</span>
                            <span class="product-percent positive">35%</span>
                        </div>
                    </div>
                    <div class="product-revenue-item">
                        <div class="product-info">
                            <div class="product-icon green">🚀</div>
                            <div>
                                <span class="product-name">Dashboard Starter</span>
                                <span class="product-sales">389 ventes</span>
                            </div>
                        </div>
                        <div class="product-stats">
                            <span class="product-amount">19,061 €</span>
                            <span class="product-percent neutral">23%</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,

    // ========== PAGE PARAMÈTRES ==========
    settings: `
        <section class="page-header-section">
            <h2 class="section-title">⚙️ Paramètres</h2>
            <p class="section-subtitle">Personnalisez votre tableau de bord</p>
        </section>

        <div class="settings-grid">
            <section class="settings-card">
                <div class="settings-card-header">
                    <h3>👤 Profil</h3>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" value="Olive" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="olive@example.com" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Photo de profil</label>
                        <div class="avatar-upload">
                            <div class="current-avatar">O</div>
                            <button class="secondary-btn">Changer</button>
                        </div>
                    </div>
                    <button class="primary-btn">Sauvegarder</button>
                </div>
            </section>

            <section class="settings-card">
                <div class="settings-card-header">
                    <h3>🔔 Notifications</h3>
                </div>
                <div class="settings-card-body">
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <span class="toggle-label">Notifications email</span>
                            <span class="toggle-desc">Recevoir les alertes par email</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <span class="toggle-label">Nouvelles commandes</span>
                            <span class="toggle-desc">Notification à chaque vente</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <span class="toggle-label">Rapports hebdomadaires</span>
                            <span class="toggle-desc">Résumé chaque lundi</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <span class="toggle-label">Alertes de stock</span>
                            <span class="toggle-desc">Prévenir quand stock bas</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </section>

            <section class="settings-card">
                <div class="settings-card-header">
                    <h3>🎨 Apparence</h3>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label>Thème</label>
                        <div class="theme-options">
                            <button class="theme-option active" data-theme="light">
                                ☀️ Clair
                            </button>
                            <button class="theme-option" data-theme="dark">
                                🌙 Sombre
                            </button>
                            <button class="theme-option" data-theme="auto">
                                🔄 Auto
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Couleur principale</label>
                        <div class="color-options">
                            <button class="color-option active" style="background: #3b82f6"></button>
                            <button class="color-option" style="background: #8b5cf6"></button>
                            <button class="color-option" style="background: #10b981"></button>
                            <button class="color-option" style="background: #f59e0b"></button>
                            <button class="color-option" style="background: #ef4444"></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Langue</label>
                        <select class="form-input">
                            <option selected>🇫🇷 Français</option>
                            <option>🇬🇧 English</option>
                            <option>🇪🇸 Español</option>
                            <option>🇩🇪 Deutsch</option>
                        </select>
                    </div>
                </div>
            </section>

            <section class="settings-card danger-zone">
                <div class="settings-card-header">
                    <h3>⚠️ Zone de danger</h3>
                </div>
                <div class="settings-card-body">
                    <div class="danger-item">
                        <div>
                            <span class="danger-title">Exporter les données</span>
                            <span class="danger-desc">Télécharger toutes vos données</span>
                        </div>
                        <button class="secondary-btn">Exporter</button>
                    </div>
                    <div class="danger-item">
                        <div>
                            <span class="danger-title">Supprimer le compte</span>
                            <span class="danger-desc">Action irréversible</span>
                        </div>
                        <button class="danger-btn">Supprimer</button>
                    </div>
                </div>
            </section>
        </div>
    `
};

// ============================================
// NAVIGATION ENTRE PAGES
// ============================================

let currentPageName = 'dashboard';

function navigateToPage(pageName) {
    const pageContent = document.getElementById('pageContent');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Mettre à jour la navigation active
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Mettre à jour le titre de la page
    const titles = {
        dashboard: 'Tableau de bord',
        statistics: 'Statistiques',
        users: 'Utilisateurs',
        revenue: 'Revenus',
        settings: 'Paramètres'
    };
    document.querySelector('.page-title').textContent = titles[pageName] || 'Dashboard';
    
    // Animation de sortie
    pageContent.style.opacity = '0';
    pageContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        // Charger le contenu
        pageContent.innerHTML = pages[pageName] || pages.dashboard;
        
        // Animation d'entrée
        pageContent.style.opacity = '1';
        pageContent.style.transform = 'translateY(0)';
        
        // Initialiser les fonctionnalités spécifiques à la page
        currentPageName = pageName;
        initPageFeatures(pageName);
    }, 200);
}

function initPageFeatures(pageName) {
    // Animer les compteurs
    setTimeout(animateCounters, 100);
    
    // Initialiser selon la page
    switch(pageName) {
        case 'dashboard':
            renderStatsCards();
            initRevenueChart();
            initTrafficChart();
            initDataTable();
            initScrollAnimations();
            initDragAndDrop();
            break;
        case 'statistics':
            initVisitorsChart();
            initDevicesChart();
            break;
        case 'users':
            initUsersTable();
            break;
        case 'revenue':
            initRevenueEvolutionChart();
            initProductRevenueChart();
            break;
        case 'settings':
            initSettingsPage();
            break;
    }
}

// ============================================
// INITIALISATION DE LA NAVIGATION
// ============================================
// ============================================
// APPLIQUER LA CONFIG À L'INTERFACE
// ============================================

function applyConfigToUI() {

    // Nom de l'application
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
        logoText.innerHTML = `${CONFIG.app.name}<span class="pro-badge">${CONFIG.app.badge}</span>`;
    }
    
    // Logo emoji
    const logoIcon = document.querySelector('.logo-icon');
    if (logoIcon) {
        logoIcon.textContent = CONFIG.app.logo;
    }
    
    // Nom d'utilisateur
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = CONFIG.user.name;
    }
    
    // Avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.textContent = CONFIG.user.avatar;
    }
}

// ============================================
// GÉNÉRER LES STATS DYNAMIQUEMENT
// ============================================

function renderStatsCards() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    const stats = CONFIG.stats;
    let html = '';
    
    for (const key in stats) {
        const stat = stats[key];
        html += `
            <div class="stat-card">
                <div class="stat-icon ${stat.color}">${stat.icon}</div>
                <div class="stat-info">
                    <span class="stat-value" data-target="${stat.value}">0</span>
                    <span class="stat-label">${stat.label}</span>
                </div>
                <span class="stat-trend ${stat.trendType}">${stat.trend}</span>
            </div>
        `;
    }
    
    statsGrid.innerHTML = html;
}

function initPageNavigation() {
    // Appliquer les données de config à l'interface
    applyConfigToUI();
    const navItems = document.querySelectorAll('.nav-item');
    
    // Ajouter les attributs data-page
    const pageMapping = {
        'Dashboard': 'dashboard',
        'Statistiques': 'statistics',
        'Utilisateurs': 'users',
        'Revenus': 'revenue',
        'Paramètres': 'settings'
    };
    
    navItems.forEach(item => {
        const text = item.textContent.trim();
        Object.keys(pageMapping).forEach(key => {
            if (text.includes(key)) {
                item.setAttribute('data-page', pageMapping[key]);
            }
        });
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) navigateToPage(page);
        });
    });
    
    // Charger la page initiale
    navigateToPage('dashboard');
}

// Mettre à jour l'initialisation principale
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNotifications();
    initPageNavigation();
});

// ============================================
// PAGE STATISTIQUES - GRAPHIQUES
// ============================================

let visitorsChart, devicesChart;

function initVisitorsChart() {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    // Générer données pour 30 jours
    const labels = [];
    const data = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
        data.push(Math.floor(Math.random() * 800) + 400);
    }
    
    visitorsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visiteurs',
                data: data,
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#1e293b',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: isDark ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: { color: isDark ? '#334155' : '#e2e8f0' },
                    ticks: { color: isDark ? '#94a3b8' : '#64748b' }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

function initDevicesChart() {
    const ctx = document.getElementById('devicesChart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    devicesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Desktop', 'Mobile', 'Tablette'],
            datasets: [{
                data: [58, 35, 7],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

// ============================================
// PAGE UTILISATEURS - TABLEAU
// ============================================

const usersData = CONFIG.users;

function initUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = usersData.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar-table" style="background: ${getAvatarColor(user.name)}">
                        ${user.name.charAt(0)}
                    </div>
                    <div class="user-info-table">
                        <span class="user-name-table">${user.name}</span>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="plan-badge ${user.plan}">${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span></td>
            <td><span class="status-badge ${user.status === 'active' ? 'completed' : 'pending'}">
                <span class="status-dot"></span>
                ${user.status === 'active' ? 'Actif' : 'En attente'}
            </span></td>
            <td>${formatDate(user.date)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" title="Modifier">✏️</button>
                    <button class="action-btn delete" title="Supprimer">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Recherche utilisateurs
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
}

// ============================================
// PAGE REVENUS - GRAPHIQUES
// ============================================

let revenueEvolutionChart, productRevenueChart;

function initRevenueEvolutionChart() {
    const ctx = document.getElementById('revenueEvolutionChart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    revenueEvolutionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
                label: 'Revenus (€)',
                data: [8500, 12200, 9800, 15600, 14200, 18900, 16500, 21200, 19800, 24100, 22500, 24580],
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#1e293b',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#94a3b8' : '#64748b' }
                },
                y: {
                    grid: { color: isDark ? '#334155' : '#e2e8f0' },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

function initProductRevenueChart() {
    const ctx = document.getElementById('productRevenueChart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    productRevenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Business', 'Pro', 'Starter'],
            datasets: [{
                data: [42, 35, 23],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

// ============================================
// PAGE PARAMÈTRES - FONCTIONNALITÉS
// ============================================

function initSettingsPage() {
    // Boutons de thème
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            themeOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const theme = btn.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('dashboard-theme', 'dark');
                document.getElementById('themeToggle').textContent = '☀️';
            } else if (theme === 'light') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('dashboard-theme', 'light');
                document.getElementById('themeToggle').textContent = '🌙';
            }
        });
    });
    
    // Couleurs
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            colorOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Bouton sauvegarder
    const saveBtn = document.querySelector('.settings-card-body .primary-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = '✓ Sauvegardé !';
            saveBtn.style.background = 'var(--accent-green)';
            setTimeout(() => {
                saveBtn.textContent = 'Sauvegarder';
                saveBtn.style.background = '';
            }, 2000);
        });
    }
}

// ============================================
// DRAG & DROP - WIDGETS
// ============================================

let draggedWidget = null;
let initialOrder = [];

function initDragAndDrop() {
    const container = document.getElementById('widgetsContainer');
    if (!container) return;
    
    const widgets = container.querySelectorAll('.widget');
    
    // Sauvegarder l'ordre initial
    initialOrder = Array.from(widgets).map(w => w.getAttribute('data-widget-id'));
    
    // Charger l'ordre sauvegardé
    loadSavedLayout(container);
    
    widgets.forEach(widget => {
        // Drag start
        widget.addEventListener('dragstart', handleDragStart);
        
        // Drag end
        widget.addEventListener('dragend', handleDragEnd);
        
        // Drag over
        widget.addEventListener('dragover', handleDragOver);
        
        // Drag enter
        widget.addEventListener('dragenter', handleDragEnter);
        
        // Drag leave
        widget.addEventListener('dragleave', handleDragLeave);
        
        // Drop
        widget.addEventListener('drop', handleDrop);
    });
    
    // Bouton reset
    const resetBtn = document.getElementById('resetLayoutBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetLayout);
    }
}

function handleDragStart(e) {
    draggedWidget = this;
    this.classList.add('dragging');
    
    // Nécessaire pour Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Délai pour l'animation
    setTimeout(() => {
        this.style.opacity = '0.5';
    }, 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    // Retirer les classes de tous les widgets
    document.querySelectorAll('.widget').forEach(widget => {
        widget.classList.remove('drag-over');
    });
    
    draggedWidget = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedWidget) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (draggedWidget !== this) {
        const container = document.getElementById('widgetsContainer');
        const allWidgets = Array.from(container.querySelectorAll('.widget'));
        
        const draggedIndex = allWidgets.indexOf(draggedWidget);
        const targetIndex = allWidgets.indexOf(this);
        
        // Animation de réorganisation
        this.classList.add('reordering');
        setTimeout(() => this.classList.remove('reordering'), 300);
        
        // Réorganiser les éléments
        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedWidget, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedWidget, this);
        }
        
        // Sauvegarder la nouvelle disposition
        saveLayout();
    }
    
    this.classList.remove('drag-over');
    return false;
}

function saveLayout() {
    const container = document.getElementById('widgetsContainer');
    if (!container) return;
    
    const widgets = container.querySelectorAll('.widget');
    const order = Array.from(widgets).map(w => w.getAttribute('data-widget-id'));
    
    localStorage.setItem('dashboard-layout', JSON.stringify(order));
    
    // Afficher le toast de confirmation
    showLayoutSavedToast();
}

function loadSavedLayout(container) {
    const savedOrder = localStorage.getItem('dashboard-layout');
    if (!savedOrder) return;
    
    try {
        const order = JSON.parse(savedOrder);
        const widgets = container.querySelectorAll('.widget');
        const widgetsMap = {};
        
        widgets.forEach(widget => {
            widgetsMap[widget.getAttribute('data-widget-id')] = widget;
        });
        
        // Réorganiser selon l'ordre sauvegardé
        order.forEach(id => {
            if (widgetsMap[id]) {
                container.appendChild(widgetsMap[id]);
            }
        });
    } catch (e) {
        console.log('Erreur chargement layout:', e);
    }
}

function resetLayout() {
    const container = document.getElementById('widgetsContainer');
    if (!container) return;
    
    const widgets = container.querySelectorAll('.widget');
    const widgetsMap = {};
    
    widgets.forEach(widget => {
        widgetsMap[widget.getAttribute('data-widget-id')] = widget;
    });
    
    // Remettre dans l'ordre initial
    initialOrder.forEach(id => {
        if (widgetsMap[id]) {
            widgetsMap[id].classList.add('reordering');
            container.appendChild(widgetsMap[id]);
            setTimeout(() => {
                widgetsMap[id].classList.remove('reordering');
            }, 300);
        }
    });
    
    // Supprimer la sauvegarde
    localStorage.removeItem('dashboard-layout');
    
    // Feedback visuel
    const btn = document.getElementById('resetLayoutBtn');
    btn.textContent = '✓ Réinitialisé !';
    setTimeout(() => {
        btn.textContent = '↺ Réinitialiser';
    }, 1500);
}

function showLayoutSavedToast() {
    // Créer le toast s'il n'existe pas
    let toast = document.querySelector('.layout-saved-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'layout-saved-toast';
        toast.textContent = '✓ Disposition sauvegardée';
        document.body.appendChild(toast);
    }
    
    // Afficher
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Masquer après 2 secondes
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ============================================
// MISE À JOUR DE initPageFeatures
// ============================================

