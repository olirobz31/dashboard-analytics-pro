/* ============================================
   DASHBOARD ANALYTICS PRO - SCRIPTS
   Version propre et complète
   ============================================ */

// ============================================
// VARIABLES GLOBALES
// ============================================

let revenueChart, trafficChart, visitorsChart, devicesChart;
let revenueEvolutionChart, productRevenueChart;
let currentPageName = 'dashboard';
let filteredData = [];
let draggedWidget = null;
let initialOrder = [];

// Configuration pagination
const rowsPerPage = 10;
let currentPage = 1;
let sortColumn = null;
let sortDirection = 'asc';

// Couleurs pour les avatars
const avatarColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'
];

// Clés localStorage
const STORAGE_KEYS = {
    orders: 'dashboard_orders',
    users: 'dashboard_users',
    products: 'dashboard_products',
    settings: 'dashboard_settings'
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

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
// GESTION DU STOCKAGE (localStorage)
// ============================================

function getData(key) {
    try {
        const data = localStorage.getItem(STORAGE_KEYS[key]);
        return data ? JSON.parse(data) : null;
    } catch(e) {
        console.error('Erreur getData:', e);
        return null;
    }
}

function setData(key, data) {
    try {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    } catch(e) {
        console.error('Erreur setData:', e);
    }
}

function initializeData() {
    if (!getData('products')) {
        setData('products', []);
    }
    if (!getData('orders')) {
        setData('orders', []);
    }
    if (!getData('users')) {
        setData('users', []);
    }
    if (!getData('settings')) {
        setData('settings', {
            appName: CONFIG.app.name,
            appBadge: CONFIG.app.badge,
            userName: CONFIG.user.name,
            userEmail: CONFIG.user.email
        });
    }
}

// ============================================
// CALCULS AUTOMATIQUES
// ============================================

function calculateStats() {
    const orders = getData('orders') || [];
    const users = getData('users') || [];
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    let totalRevenue = 0;
    completedOrders.forEach(o => {
        const amount = Number(o.amount);
        if (!isNaN(amount)) totalRevenue += amount;
    });
    
    const totalOrders = orders.length;
    const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    
    return {
        revenue: totalRevenue,
        orders: totalOrders,
        completedOrders: completedOrders.length,
        averageOrder: averageOrder,
        users: totalUsers,
        activeUsers: activeUsers
    };
}

function getMonthlyRevenue() {
    const orders = getData('orders') || [];
    const monthlyData = Array(12).fill(0);
    
    orders.forEach(order => {
        if (order.status === 'completed') {
            const date = new Date(order.date);
            const month = date.getMonth();
            const amount = Number(order.amount);
            if (!isNaN(amount) && !isNaN(month)) {
                monthlyData[month] += amount;
            }
        }
    });
    
    return monthlyData;
}

// ============================================
// ANIMATION DES COMPTEURS
// ============================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        if (isNaN(target)) return;
        
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (target - start) * easeOutQuart;
            
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
    if (!themeToggle) return;
    
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('dashboard-theme');
    
    if (savedTheme === 'auto') {
        applyAutoTheme();
    } else if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        html.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('dashboard-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // Écouter les changements du système (si mode auto)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('dashboard-theme') === 'auto') {
            applyAutoTheme();
        }
    });
}

function applyAutoTheme() {
    // Détecter le mode système (clair ou sombre)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '🌙';
    }
}

// ============================================
// APPLIQUER LA CONFIG À L'INTERFACE
// ============================================

function applyConfigToUI() {
    // Récupérer les paramètres sauvegardés
    const savedSettings = getData('settings') || {};
    const savedAvatar = localStorage.getItem('dashboard-avatar');
    const savedAvatarImage = localStorage.getItem('dashboard-avatar-image');
    const savedAvatarColor = localStorage.getItem('dashboard-avatar-color') || '#3b82f6';
    
    // Nom de l'app
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
        const appName = savedSettings.appName || CONFIG.app.name;
        const appBadge = savedSettings.appBadge || CONFIG.app.badge;
        logoText.innerHTML = `${appName}<span class="pro-badge">${appBadge}</span>`;
    }
    
    // Icône logo
    const logoIcon = document.querySelector('.logo-icon');
    if (logoIcon) {
        logoIcon.textContent = CONFIG.app.logo;
    }
    
    // Nom utilisateur
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = savedSettings.userName || CONFIG.user.name;
    }
    
    // Avatar utilisateur
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        if (savedAvatarImage) {
            userAvatar.style.background = `url(${savedAvatarImage}) center/cover`;
            userAvatar.textContent = '';
        } else if (savedAvatar) {
            userAvatar.style.background = savedAvatarColor;
            userAvatar.textContent = savedAvatar;
        } else {
            const firstLetter = savedSettings.userName ? savedSettings.userName.charAt(0).toUpperCase() : CONFIG.user.avatar;
            userAvatar.style.background = savedAvatarColor;
            userAvatar.textContent = firstLetter;
        }
    }
    
    // Appliquer la couleur principale sauvegardée
    const savedColor = localStorage.getItem('dashboard-color');
    if (savedColor) {
        applyColor(savedColor);
    }
}

// ============================================
// PAGES - CONTENU HTML
// ============================================

const pages = {
    // ========== PAGE DASHBOARD ==========
    dashboard: `
        <div class="dashboard-toolbar">
            <span class="toolbar-hint">💡 Glissez-déposez les widgets pour personnaliser votre dashboard</span>
            <button class="reset-layout-btn" id="resetLayoutBtn">↺ Réinitialiser</button>
        </div>
        <div class="widgets-container" id="widgetsContainer">
            <div class="widget" draggable="true" data-widget-id="stats">
                <div class="widget-drag-handle">⋮⋮</div>
                <section class="stats-grid" id="statsGrid"></section>
            </div>
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
            <div class="widget" draggable="true" data-widget-id="traffic-chart">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Ventes par produit</h3>
                    </div>
                    <canvas id="trafficChart"></canvas>
                </div>
            </div>
            <div class="widget" draggable="true" data-widget-id="activity">
                <div class="widget-drag-handle">⋮⋮</div>
                <div class="activity-card">
                    <div class="chart-header">
                        <h3>Activité récente</h3>
                        <a href="#" class="view-all">Voir tout →</a>
                    </div>
                    <div class="activity-list" id="activityList"></div>
                </div>
            </div>
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
                            <tbody id="tableBody"></tbody>
                        </table>
                    </div>
                    <div class="table-footer">
                        <span class="table-info" id="tableInfo">Affichage 1-10 sur 25</span>
                        <div class="pagination" id="pagination"></div>
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
        <section class="stats-grid" id="statsPageGrid"></section>
        <section class="charts-grid">
            <div class="chart-card large">
                <div class="chart-header">
                    <h3>Évolution des ventes</h3>
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
                    <h3>Répartition par statut</h3>
                </div>
                <canvas id="devicesChart"></canvas>
            </div>
        </section>
        <section class="charts-grid" style="margin-top: 24px;">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Top clients</h3>
                </div>
                <div class="top-pages-list" id="topClientsList"></div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Répartition par plan</h3>
                </div>
                <div class="countries-list" id="plansList"></div>
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
        <section class="stats-grid four-cols" id="usersStatsGrid"></section>
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
                        <tbody id="usersTableBody"></tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span class="table-info" id="usersTableInfo">Affichage 1-10 sur 50</span>
                    <div class="pagination" id="usersPagination"></div>
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
        <section class="stats-grid" id="revenueStatsGrid"></section>
        <section class="charts-grid">
            <div class="chart-card large">
                <div class="chart-header">
                    <h3>Évolution des revenus</h3>
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
                <div class="product-revenue-list" id="productRevenueList"></div>
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
                        <input type="text" id="profileName" class="form-input" placeholder="Votre nom">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" class="form-input" placeholder="email@exemple.com">
                    </div>
                    <div class="form-group">
                        <label>Photo de profil</label>
                        <div class="avatar-upload">
                            <div class="current-avatar">O</div>
                            <button class="secondary-btn">Changer</button>
                        </div>
                    </div>
                    <button class="primary-btn" id="saveProfileBtn">Sauvegarder</button>
                </div>
            </section>
            <section class="settings-card">
                <div class="settings-card-header">
                    <h3>🔔 Notifications</h3>
                </div>
                <div class="settings-card-body">
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <span class="toggle-label">Nouvelles commandes</span>
                            <span class="toggle-desc">Afficher les notifications de ventes</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="notifOrdersToggle" checked>
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
                            <button class="theme-option active" data-theme="light">☀️ Clair</button>
                            <button class="theme-option" data-theme="dark">🌙 Sombre</button>
                            <button class="theme-option" data-theme="auto">🔄 Auto</button>
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
             
                </div>
            </section>
            <section class="settings-card">
                <div class="settings-card-header">
                    <h3>💾 Sauvegarde</h3>
                </div>
                <div class="settings-card-body">
                    <div class="danger-item">
                        <div>
                            <span class="danger-title">Exporter les données</span>
                            <span class="danger-desc">Télécharger toutes vos données en JSON</span>
                        </div>
                        <button class="secondary-btn" id="exportDataBtn">📥 Exporter</button>
                    </div>
                    <div class="danger-item">
                        <div>
                            <span class="danger-title">Importer les données</span>
                            <span class="danger-desc">Restaurer depuis un fichier JSON</span>
                        </div>
                        <label class="secondary-btn import-btn">
                            📤 Importer
                            <input type="file" id="importDataInput" accept=".json" hidden>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    `,

    // ========== PAGE ADMIN ==========
    admin: `
        <section class="page-header-section">
            <h2 class="section-title">🔧 Administration</h2>
            <p class="section-subtitle">Gérez vos données — Les statistiques se calculent automatiquement</p>
        </section>
        <div class="admin-tabs">
            <button class="admin-tab active" data-tab="orders">📦 Commandes</button>
            <button class="admin-tab" data-tab="users">👥 Utilisateurs</button>
            <button class="admin-tab" data-tab="products">🏷️ Produits</button>
            <button class="admin-tab" data-tab="settings">⚙️ Paramètres</button>
        </div>
        <div class="admin-content">
            <div class="admin-panel active" id="panel-orders">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Ajouter une commande</h3>
                    </div>
                    <div class="admin-card-body">
                        <form id="orderForm" class="admin-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Client</label>
                                    <input type="text" id="orderClient" class="form-input" placeholder="Nom du client" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="orderEmail" class="form-input" placeholder="email@exemple.com">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Produit</label>
                                    <select id="orderProduct" class="form-input" required>
                                        <option value="">Sélectionner...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Montant (€)</label>
                                    <input type="number" id="orderAmount" class="form-input" placeholder="0" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date</label>
                                    <input type="date" id="orderDate" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select id="orderStatus" class="form-input">
                                        <option value="completed">Terminé</option>
                                        <option value="processing">En cours</option>
                                        <option value="pending">En attente</option>
                                        <option value="cancelled">Annulé</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="primary-btn">➕ Ajouter la commande</button>
                        </form>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Liste des commandes</h3>
                        <span class="admin-count" id="ordersCount">0 commandes</span>
                    </div>
                    <div class="admin-card-body">
                        <div class="admin-table-container">
                            <table class="admin-table" id="adminOrdersTable">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Produit</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminOrdersBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="admin-stats-preview">
                    <h4>📊 Aperçu des statistiques (calculées automatiquement)</h4>
                    <div class="preview-stats">
                        <div class="preview-stat">
                            <span class="preview-value" id="previewRevenue">0 €</span>
                            <span class="preview-label">Revenus total</span>
                        </div>
                        <div class="preview-stat">
                            <span class="preview-value" id="previewOrders">0</span>
                            <span class="preview-label">Commandes</span>
                        </div>
                        <div class="preview-stat">
                            <span class="preview-value" id="previewAverage">0 €</span>
                            <span class="preview-label">Panier moyen</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="admin-panel" id="panel-users">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Ajouter un utilisateur</h3>
                    </div>
                    <div class="admin-card-body">
                        <form id="adminUserForm" class="admin-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nom</label>
                                    <input type="text" id="adminUserName" class="form-input" placeholder="Nom complet" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="adminUserEmail" class="form-input" placeholder="email@exemple.com" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Plan</label>
                                    <select id="adminUserPlan" class="form-input">
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="business">Business</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select id="adminUserStatus" class="form-input">
                                        <option value="active">Actif</option>
                                        <option value="pending">En attente</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="primary-btn">➕ Ajouter l'utilisateur</button>
                        </form>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Liste des utilisateurs</h3>
                        <span class="admin-count" id="adminUsersCount">0 utilisateurs</span>
                    </div>
                    <div class="admin-card-body">
                        <div class="admin-table-container">
                            <table class="admin-table" id="adminUsersTable">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Email</th>
                                        <th>Plan</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminUsersBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="admin-panel" id="panel-products">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Ajouter un produit</h3>
                    </div>
                    <div class="admin-card-body">
                        <form id="productForm" class="admin-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nom du produit</label>
                                    <input type="text" id="productName" class="form-input" placeholder="Dashboard Pro" required>
                                </div>
                                <div class="form-group">
                                    <label>Prix (€)</label>
                                    <input type="number" id="productPrice" class="form-input" placeholder="99" required>
                                </div>
                            </div>
                            <button type="submit" class="primary-btn">➕ Ajouter le produit</button>
                        </form>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Liste des produits</h3>
                        <span class="admin-count" id="productsCount">0 produits</span>
                    </div>
                    <div class="admin-card-body">
                        <div class="admin-table-container">
                            <table class="admin-table" id="adminProductsTable">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Prix</th>
                                        <th>Ventes</th>
                                        <th>Revenus</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminProductsBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="admin-panel" id="panel-settings">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Informations générales</h3>
                    </div>
                    <div class="admin-card-body">
                        <form id="settingsForm" class="admin-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nom de l'application</label>
                                    <input type="text" id="settingsAppName" class="form-input" placeholder="Analytics" required>
                                </div>
                                <div class="form-group">
                                    <label>Badge</label>
                                    <input type="text" id="settingsAppBadge" class="form-input" placeholder="PRO">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Votre nom</label>
                                    <input type="text" id="settingsUserName" class="form-input" placeholder="Votre nom" required>
                                </div>
                                <div class="form-group">
                                    <label>Votre email</label>
                                    <input type="email" id="settingsUserEmail" class="form-input" placeholder="email@exemple.com">
                                </div>
                            </div>
                            <button type="submit" class="primary-btn">💾 Sauvegarder</button>
                        </form>
                    </div>
                </div>
                <div class="admin-card danger-zone">
                    <div class="admin-card-header">
                        <h3>⚠️ Zone de danger</h3>
                    </div>
                    <div class="admin-card-body">
                        <div class="danger-item">
                            <div>
                                <span class="danger-title">Réinitialiser les données</span>
                                <span class="danger-desc">Supprimer toutes les commandes et utilisateurs</span>
                            </div>
                            <button class="danger-btn" id="resetDataBtn">Réinitialiser</button>
                        </div>
                        <div class="danger-item">
                            <div>
                                <span class="danger-title">Charger les données de démo</span>
                                <span class="danger-desc">Remplir avec des exemples</span>
                            </div>
                            <button class="secondary-btn" id="loadDemoBtn">Charger démo</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// ============================================
// NAVIGATION ENTRE PAGES
// ============================================

function navigateToPage(pageName) {
    const pageContent = document.getElementById('pageContent');
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    const titles = {
        dashboard: 'Tableau de bord',
        statistics: 'Statistiques',
        users: 'Utilisateurs',
        revenue: 'Revenus',
        settings: 'Paramètres',
        admin: 'Administration'
    };
    document.querySelector('.page-title').textContent = titles[pageName] || 'Dashboard';
    
    pageContent.style.opacity = '0';
    pageContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        pageContent.innerHTML = pages[pageName] || pages.dashboard;
        pageContent.style.opacity = '1';
        pageContent.style.transform = 'translateY(0)';
        currentPageName = pageName;
        initPageFeatures(pageName);
    }, 200);
}

function initPageNavigation() {
    applyConfigToUI();
    
    const navItems = document.querySelectorAll('.nav-item');
    const pageMapping = {
        'Dashboard': 'dashboard',
        'Statistiques': 'statistics',
        'Utilisateurs': 'users',
        'Revenus': 'revenue',
        'Paramètres': 'settings',
        'Admin': 'admin'
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
    
    navigateToPage('dashboard');
}

function initPageFeatures(pageName) {
    setTimeout(animateCounters, 100);
    
    switch(pageName) {
        case 'dashboard':
            renderStatsCards();
            renderActivityList();
            initRevenueChart();
            initTrafficChart();
            initDataTable();
            initScrollAnimations();
            initDragAndDrop();
            break;
        case 'statistics':
            renderStatsPageCards();
            initVisitorsChart();
            initDevicesChart();
            renderTopClients();
            renderPlansList();
            break;
        case 'users':
            renderUsersStatsCards();
            initUsersTable();
            break;
        case 'revenue':
            renderRevenueStats();
            initRevenueEvolutionChart();
            initProductRevenueChart();
            renderProductRevenueList();
            break;
        case 'settings':
            initSettingsPage();
            break;
        case 'admin':
            initAdminPage();
            break;
    }
}

// ============================================
// DASHBOARD - STATS CARDS
// ============================================

function renderStatsCards() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    const orders = getData('orders') || [];
    const users = getData('users') || [];
    
    // Dates pour comparaison
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    // Filtrer les commandes par mois
    const thisMonthOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear && o.status === 'completed';
    });
    
    const lastMonthOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && o.status === 'completed';
    });
    
    // Calculs ce mois
    let thisMonthRevenue = 0;
    thisMonthOrders.forEach(o => {
        const amount = Number(o.amount);
        if (!isNaN(amount)) thisMonthRevenue += amount;
    });
    
    // Calculs mois dernier
    let lastMonthRevenue = 0;
    lastMonthOrders.forEach(o => {
        const amount = Number(o.amount);
        if (!isNaN(amount)) lastMonthRevenue += amount;
    });
    
    // Utilisateurs ce mois vs mois dernier
    const thisMonthUsers = users.filter(u => {
        const d = new Date(u.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    
    const lastMonthUsers = users.filter(u => {
        const d = new Date(u.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;
    
    // Commandes ce mois vs mois dernier
    const thisMonthOrdersCount = thisMonthOrders.length;
    const lastMonthOrdersCount = lastMonthOrders.length;
    
    // Taux de conversion ce mois vs mois dernier
    const thisMonthAllOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const thisMonthCompleted = thisMonthAllOrders.filter(o => o.status === 'completed').length;
    const thisMonthConversion = thisMonthAllOrders.length > 0 ? (thisMonthCompleted / thisMonthAllOrders.length * 100) : 0;
    
    const lastMonthAllOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const lastMonthCompleted = lastMonthAllOrders.filter(o => o.status === 'completed').length;
    const lastMonthConversion = lastMonthAllOrders.length > 0 ? (lastMonthCompleted / lastMonthAllOrders.length * 100) : 0;
    
    const conversionTrend = calcTrend(thisMonthConversion, lastMonthConversion);
    
    // Fonction pour calculer le pourcentage de variation
    function calcTrend(current, previous) {
        if (previous === 0) {
            return current > 0 ? { value: '+100%', type: 'positive' } : { value: '0%', type: 'neutral' };
        }
        const percent = ((current - previous) / previous * 100).toFixed(1);
        if (percent > 0) {
            return { value: '+' + percent + '%', type: 'positive' };
        } else if (percent < 0) {
            return { value: percent + '%', type: 'negative' };
        } else {
            return { value: '0%', type: 'neutral' };
        }
    }
    
    const revenueTrend = calcTrend(thisMonthRevenue, lastMonthRevenue);
    const usersTrend = calcTrend(thisMonthUsers, lastMonthUsers);
    const ordersTrend = calcTrend(thisMonthOrdersCount, lastMonthOrdersCount);
    
    const stats = [
        { value: thisMonthRevenue, label: 'Revenus (€)', trend: revenueTrend.value, trendType: revenueTrend.type, icon: '💶', color: 'blue' },
        { value: users.length, label: 'Utilisateurs', trend: usersTrend.value, trendType: usersTrend.type, icon: '👥', color: 'green' },
        { value: orders.length, label: 'Commandes', trend: ordersTrend.value, trendType: ordersTrend.type, icon: '🛒', color: 'orange' },
        { value: thisMonthConversion.toFixed(1), label: 'Taux conversion', trend: conversionTrend.value, trendType: conversionTrend.type, icon: '🎯', color: 'purple', isPercent: true }
    ];
    
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon ${stat.color}">${stat.icon}</div>
            <div class="stat-info">
                <span class="stat-value" data-target="${stat.value}">0</span>${stat.isPercent ? '<span class="stat-percent">%</span>' : ''}
                <span class="stat-label">${stat.label}</span>
                <span class="stat-trend-line"><span class="stat-trend ${stat.trendType}">${stat.trend}</span> vs mois dernier</span>
            </div>
        </div>
    `).join('');
}

function renderActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const orders = getData('orders') || [];
    const recentOrders = orders.slice(0, 4);
    
    if (recentOrders.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune activité récente</p>';
        return;
    }
    
    activityList.innerHTML = recentOrders.map(order => `
        <div class="activity-item">
            <div class="activity-icon ${order.status === 'completed' ? 'green' : 'orange'}">
                ${order.status === 'completed' ? '✓' : '🕐'}
            </div>
            <div class="activity-info">
                <span class="activity-text">Commande de ${order.client}</span>
                <span class="activity-time">${order.product}</span>
            </div>
            ${order.status === 'completed' ? `<span class="activity-amount">+${order.amount}€</span>` : ''}
        </div>
    `).join('');
}

// ============================================
// DASHBOARD - GRAPHIQUE REVENUS
// ============================================

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (revenueChart) revenueChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    const monthlyData = getMonthlyRevenue();
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
                label: 'Revenus (€)',
                data: monthlyData,
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
                legend: { display: false },
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
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

// ============================================
// DASHBOARD - GRAPHIQUE VENTES PAR PRODUIT
// ============================================

function initTrafficChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;
    
    if (trafficChart) trafficChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const orders = getData('orders') || [];
    const products = getData('products') || [];
    
    const salesByProduct = {};
    products.forEach(p => { salesByProduct[p.name] = 0; });
    
    orders.forEach(order => {
        if (order.status === 'completed' && salesByProduct.hasOwnProperty(order.product)) {
            salesByProduct[order.product]++;
        }
    });
    
    const labels = Object.keys(salesByProduct);
    const data = Object.values(salesByProduct);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const hasData = data.some(v => v > 0);
    
    trafficChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hasData ? labels : ['Aucune vente'],
            datasets: [{
                data: hasData ? data : [1],
                backgroundColor: hasData ? colors.slice(0, labels.length) : ['#e2e8f0'],
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
                            if (!hasData) return 'Ajoutez des commandes dans Admin';
                            const total = data.reduce((a, b) => a + b, 0);
                            const percent = Math.round((context.parsed / total) * 100);
                            return context.label + ': ' + context.parsed + ' ventes (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

// ============================================
// DASHBOARD - TABLEAU DES COMMANDES
// ============================================

function initDataTable() {
    const orders = getData('orders');
    filteredData = orders && orders.length > 0 ? [...orders] : [];
    currentPage = 1;
    
    renderTable();
    initTableSearch();
    initTableSort();
    initExport();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucune commande</td></tr>';
    } else {
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
    }
    
    updateTableInfo();
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    let html = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">←</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }
    
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">→</button>`;
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
    const tableInfo = document.getElementById('tableInfo');
    if (!tableInfo) return;
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, filteredData.length);
    tableInfo.textContent = `Affichage ${start}-${end} sur ${filteredData.length}`;
}

function initTableSearch() {
    const searchInput = document.getElementById('tableSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const orders = getData('orders') || [];
        
        filteredData = orders.filter(order =>
            (order.id && order.id.toLowerCase().includes(query)) ||
            (order.client && order.client.toLowerCase().includes(query)) ||
            (order.product && order.product.toLowerCase().includes(query)) ||
            getStatusLabel(order.status).toLowerCase().includes(query)
        );
        
        currentPage = 1;
        renderTable();
    });
}

function initTableSort() {
    const headers = document.querySelectorAll('.data-table th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            
            header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            
            filteredData.sort((a, b) => {
                let valueA = a[column];
                let valueB = b[column];
                
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

function initExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;
    
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
        
        exportBtn.innerHTML = '<span>✓</span> Exporté !';
        setTimeout(() => { exportBtn.innerHTML = '<span>📥</span> Exporter'; }, 2000);
    });
}

// ============================================
// DASHBOARD - ANIMATIONS SCROLL
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
    
    const cards = document.querySelectorAll('.stat-card, .chart-card, .activity-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ============================================
// DASHBOARD - DRAG AND DROP
// ============================================

function initDragAndDrop() {
    const container = document.getElementById('widgetsContainer');
    if (!container) return;
    
    const widgets = container.querySelectorAll('.widget');
    initialOrder = Array.from(widgets).map(w => w.getAttribute('data-widget-id'));
    
    loadSavedLayout(container);
    
    widgets.forEach(widget => {
        widget.addEventListener('dragstart', handleDragStart);
        widget.addEventListener('dragend', handleDragEnd);
        widget.addEventListener('dragover', handleDragOver);
        widget.addEventListener('dragenter', handleDragEnter);
        widget.addEventListener('dragleave', handleDragLeave);
        widget.addEventListener('drop', handleDrop);
    });
    
    const resetBtn = document.getElementById('resetLayoutBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetLayout);
    }
}

function handleDragStart(e) {
    draggedWidget = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    setTimeout(() => { this.style.opacity = '0.5'; }, 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
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
        
        this.classList.add('reordering');
        setTimeout(() => this.classList.remove('reordering'), 300);
        
        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedWidget, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedWidget, this);
        }
        
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
    
    initialOrder.forEach(id => {
        if (widgetsMap[id]) {
            widgetsMap[id].classList.add('reordering');
            container.appendChild(widgetsMap[id]);
            setTimeout(() => { widgetsMap[id].classList.remove('reordering'); }, 300);
        }
    });
    
    localStorage.removeItem('dashboard-layout');
    
    const btn = document.getElementById('resetLayoutBtn');
    if (btn) {
        btn.textContent = '✓ Réinitialisé !';
        setTimeout(() => { btn.textContent = '↺ Réinitialiser'; }, 1500);
    }
}

function showLayoutSavedToast() {
    let toast = document.querySelector('.layout-saved-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'layout-saved-toast';
        toast.textContent = '✓ Disposition sauvegardée';
        document.body.appendChild(toast);
    }
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// ============================================
// PAGE STATISTIQUES
// ============================================

function renderStatsPageCards() {
    const statsGrid = document.getElementById('statsPageGrid');
    if (!statsGrid) return;
    
    const orders = getData('orders') || [];
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    let totalRevenue = 0;
    completedOrders.forEach(o => {
        const amount = Number(o.amount);
        if (!isNaN(amount)) totalRevenue += amount;
    });
    
    const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const conversionRate = orders.length > 0 ? (completedOrders.length / orders.length * 100) : 0;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue">💶</div>
            <div class="stat-info">
                <span class="stat-value">${totalRevenue.toLocaleString('fr-FR')} €</span>
                <span class="stat-label">Revenus total</span>
            </div>
            <span class="stat-trend positive">+12.5%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">✓</div>
            <div class="stat-info">
                <span class="stat-value">${completedOrders.length}</span>
                <span class="stat-label">Ventes complétées</span>
            </div>
            <span class="stat-trend positive">+8.2%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">🛒</div>
            <div class="stat-info">
                <span class="stat-value">${Math.round(averageOrder)} €</span>
                <span class="stat-label">Panier moyen</span>
            </div>
            <span class="stat-trend positive">+5.1%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple">🎯</div>
            <div class="stat-info">
                <span class="stat-value">${conversionRate.toFixed(1)}%</span>
                <span class="stat-label">Taux de conversion</span>
            </div>
            <span class="stat-trend positive">+2.3%</span>
        </div>
    `;
}

function initVisitorsChart() {
    const ctx = document.getElementById('visitorsChart');
    if (!ctx) return;
    
    // Récupérer le filtre sélectionné
    const filterSelect = document.getElementById('visitorsFilter');
    const days = filterSelect ? parseInt(filterSelect.value) : 30;
    
    if (visitorsChart) visitorsChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    const orders = getData('orders') || [];
    const labels = [];
    const data = [];
    
    // Générer les données pour le nombre de jours sélectionné
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
        
        let daySales = 0;
        orders.filter(o => o.date === dateStr && o.status === 'completed').forEach(o => {
            const amount = Number(o.amount);
            if (!isNaN(amount)) daySales += amount;
        });
        data.push(daySales);
    }
    
    visitorsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventes (€)',
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
                    padding: 12,
                    callbacks: {
                        label: function(context) { return context.parsed.y + ' €'; }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#94a3b8' : '#64748b', maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: isDark ? '#334155' : '#e2e8f0' },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: function(value) { return value + ' €'; }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
    
    // Ajouter l'événement sur le filtre
    if (filterSelect) {
        filterSelect.removeEventListener('change', handleFilterChange);
        filterSelect.addEventListener('change', handleFilterChange);
    }
}

function handleFilterChange() {
    initVisitorsChart();
}

function initDevicesChart() {
    const ctx = document.getElementById('devicesChart');
    if (!ctx) return;
    
    if (devicesChart) devicesChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const orders = getData('orders') || [];
    
    const completed = orders.filter(o => o.status === 'completed').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    
    const hasData = orders.length > 0;
    
    devicesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hasData ? ['Terminé', 'En cours', 'En attente', 'Annulé'] : ['Aucune donnée'],
            datasets: [{
                data: hasData ? [completed, processing, pending, cancelled] : [1],
                backgroundColor: hasData ? ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] : ['#e2e8f0'],
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
                            if (!hasData) return 'Ajoutez des commandes dans Admin';
                            return context.label + ': ' + context.parsed + ' commandes';
                        }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

function renderTopClients() {
    const container = document.getElementById('topClientsList');
    if (!container) return;
    
    const orders = getData('orders') || [];
    const clientTotals = {};
    
    orders.filter(o => o.status === 'completed').forEach(order => {
        const amount = Number(order.amount);
        if (!isNaN(amount)) {
            if (!clientTotals[order.client]) clientTotals[order.client] = 0;
            clientTotals[order.client] += amount;
        }
    });
    
    const sortedClients = Object.entries(clientTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxAmount = sortedClients.length > 0 ? sortedClients[0][1] : 0;
    
    if (sortedClients.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune donnée</p>';
        return;
    }
    
    container.innerHTML = sortedClients.map((client, index) => `
        <div class="top-page-item">
            <span class="page-rank">${index + 1}</span>
            <div class="page-info">
                <span class="page-name">${client[0]}</span>
                <div class="page-bar"><div class="page-bar-fill" style="width: ${(client[1] / maxAmount) * 100}%"></div></div>
            </div>
            <span class="page-views">${client[1].toLocaleString('fr-FR')} €</span>
        </div>
    `).join('');
}

function renderPlansList() {
    const container = document.getElementById('plansList');
    if (!container) return;
    
    const users = getData('users') || [];
    
    const planCounts = {
        starter: users.filter(u => u.plan === 'starter').length,
        pro: users.filter(u => u.plan === 'pro').length,
        business: users.filter(u => u.plan === 'business').length
    };
    
    const total = users.length || 1;
    
    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucun utilisateur</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="country-item">
            <span class="country-flag">🚀</span>
            <span class="country-name">Starter</span>
            <span class="country-percent">${planCounts.starter} (${Math.round(planCounts.starter / total * 100)}%)</span>
        </div>
        <div class="country-item">
            <span class="country-flag">⭐</span>
            <span class="country-name">Pro</span>
            <span class="country-percent">${planCounts.pro} (${Math.round(planCounts.pro / total * 100)}%)</span>
        </div>
        <div class="country-item">
            <span class="country-flag">👑</span>
            <span class="country-name">Business</span>
            <span class="country-percent">${planCounts.business} (${Math.round(planCounts.business / total * 100)}%)</span>
        </div>
    `;
}

// ============================================
// PAGE UTILISATEURS
// ============================================

function renderUsersStatsCards() {
    const statsGrid = document.getElementById('usersStatsGrid');
    if (!statsGrid) return;
    
    const users = getData('users') || [];
    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;
    const premiumUsers = users.filter(u => u.plan === 'business').length;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue">👥</div>
            <div class="stat-info">
                <span class="stat-value">${users.length}</span>
                <span class="stat-label">Total utilisateurs</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">✓</div>
            <div class="stat-info">
                <span class="stat-value">${activeUsers}</span>
                <span class="stat-label">Actifs</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">🕐</div>
            <div class="stat-info">
                <span class="stat-value">${pendingUsers}</span>
                <span class="stat-label">En attente</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple">👑</div>
            <div class="stat-info">
                <span class="stat-value">${premiumUsers}</span>
                <span class="stat-label">Premium</span>
            </div>
        </div>
    `;
}

function initUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    renderUsersTableContent();
    
    // Bouton ajouter utilisateur
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            openUserModal();
        });
    }
    
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
    
    // Filtre par statut
    const filterSelect = document.getElementById('userFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderUsersTableContent(filterSelect.value);
        });
    }
}

function renderUsersTableContent(filter = 'all') {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    let users = getData('users') || [];
    
    // Appliquer le filtre
    if (filter === 'active') {
        users = users.filter(u => u.status === 'active');
    } else if (filter === 'pending') {
        users = users.filter(u => u.status === 'pending');
    }
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">Aucun utilisateur. Cliquez sur "Ajouter un utilisateur" !</td></tr>';
        updateUsersTableInfo(0);
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
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
                    <button class="action-btn edit-user-btn" title="Modifier" data-id="${user.id}">✏️</button>
                    <button class="action-btn delete delete-user-btn" title="Supprimer" data-id="${user.id}">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Ajouter les événements aux boutons
    tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-id'));
            openUserModal(userId);
        });
    });
    
    tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-id'));
            deleteUserFromPage(userId);
        });
    });
    
    updateUsersTableInfo(users.length);
}

function updateUsersTableInfo(count) {
    const info = document.getElementById('usersTableInfo');
    if (info) {
        info.textContent = `Affichage 1-${count} sur ${count}`;
    }
}

function openUserModal(userId = null) {
    const users = getData('users') || [];
    const user = userId ? users.find(u => u.id === userId) : null;
    const isEdit = !!user;
    
    const modal = document.createElement('div');
    modal.className = 'avatar-modal';
    modal.innerHTML = `
        <div class="avatar-modal-content">
            <div class="avatar-modal-header">
                <h3>${isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
                <button class="avatar-modal-close">✕</button>
            </div>
            <div class="avatar-modal-body">
                <form id="pageUserForm" class="admin-form">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" id="pageUserName" class="form-input" placeholder="Nom complet" value="${user ? user.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="pageUserEmail" class="form-input" placeholder="email@exemple.com" value="${user ? user.email : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Plan</label>
                        <select id="pageUserPlan" class="form-input">
                            <option value="starter" ${user && user.plan === 'starter' ? 'selected' : ''}>Starter</option>
                            <option value="pro" ${user && user.plan === 'pro' ? 'selected' : ''}>Pro</option>
                            <option value="business" ${user && user.plan === 'business' ? 'selected' : ''}>Business</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="pageUserStatus" class="form-input">
                            <option value="active" ${user && user.status === 'active' ? 'selected' : ''}>Actif</option>
                            <option value="pending" ${user && user.status === 'pending' ? 'selected' : ''}>En attente</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="avatar-modal-footer">
                <button class="secondary-btn modal-cancel">Annuler</button>
                <button class="primary-btn modal-save">${isEdit ? 'Modifier' : 'Ajouter'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Fermer
    modal.querySelector('.avatar-modal-close').addEventListener('click', () => closeAvatarModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeAvatarModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAvatarModal(modal);
    });
    
    // Sauvegarder
    modal.querySelector('.modal-save').addEventListener('click', () => {
        const name = document.getElementById('pageUserName').value.trim();
        const email = document.getElementById('pageUserEmail').value.trim();
        const plan = document.getElementById('pageUserPlan').value;
        const status = document.getElementById('pageUserStatus').value;
        
        if (!name || !email) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        let users = getData('users') || [];
        
        if (isEdit) {
            // Modifier
            users = users.map(u => {
                if (u.id === userId) {
                    return { ...u, name, email, plan, status };
                }
                return u;
            });
            showSettingsToast('Utilisateur modifié !');
        } else {
            // Ajouter
            const newUser = {
                id: Date.now(),
                name,
                email,
                plan,
                status,
                date: new Date().toISOString().split('T')[0]
            };
            users.unshift(newUser);
            showSettingsToast('Utilisateur ajouté !');
        }
        
        setData('users', users);
        renderUsersTableContent();
        renderUsersStatsCards();
        closeAvatarModal(modal);
    });
}

function deleteUserFromPage(userId) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    
    let users = getData('users') || [];
    users = users.filter(u => u.id !== userId);
    setData('users', users);
    
    renderUsersTableContent();
    renderUsersStatsCards();
    showSettingsToast('Utilisateur supprimé');
}

// ============================================
// PAGE REVENUS
// ============================================

function renderRevenueStats() {
    const statsGrid = document.getElementById('revenueStatsGrid');
    if (!statsGrid) return;
    
    const orders = getData('orders') || [];
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    let totalRevenue = 0;
    completedOrders.forEach(o => {
        const amount = Number(o.amount);
        if (!isNaN(amount)) totalRevenue += amount;
    });
    
    const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let monthlyRevenue = 0;
    completedOrders.forEach(o => {
        const d = new Date(o.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const amount = Number(o.amount);
            if (!isNaN(amount)) monthlyRevenue += amount;
        }
    });
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue">💶</div>
            <div class="stat-info">
                <span class="stat-value">${monthlyRevenue.toLocaleString('fr-FR')} €</span>
                <span class="stat-label">Revenus ce mois</span>
            </div>
            <span class="stat-trend positive">+12.5%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">📈</div>
            <div class="stat-info">
                <span class="stat-value">${totalRevenue.toLocaleString('fr-FR')} €</span>
                <span class="stat-label">Revenus total</span>
            </div>
            <span class="stat-trend positive">+28.3%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">🎫</div>
            <div class="stat-info">
                <span class="stat-value">${Math.round(averageOrder)} €</span>
                <span class="stat-label">Panier moyen</span>
            </div>
            <span class="stat-trend positive">+5.2%</span>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple">🛒</div>
            <div class="stat-info">
                <span class="stat-value">${completedOrders.length}</span>
                <span class="stat-label">Ventes complétées</span>
            </div>
            <span class="stat-trend positive">+8.1%</span>
        </div>
    `;
}

function initRevenueEvolutionChart() {
    const ctx = document.getElementById('revenueEvolutionChart');
    if (!ctx) return;
    
    if (revenueEvolutionChart) revenueEvolutionChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const monthlyData = getMonthlyRevenue();
    
    revenueEvolutionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
                label: 'Revenus (€)',
                data: monthlyData,
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
    
    if (productRevenueChart) productRevenueChart.destroy();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const orders = getData('orders') || [];
    const products = getData('products') || [];
    
    const revenueByProduct = {};
    products.forEach(p => { revenueByProduct[p.name] = 0; });
    
    orders.forEach(order => {
        if (order.status === 'completed' && revenueByProduct.hasOwnProperty(order.product)) {
            const amount = Number(order.amount);
            if (!isNaN(amount)) revenueByProduct[order.product] += amount;
        }
    });
    
    const labels = Object.keys(revenueByProduct);
    const data = Object.values(revenueByProduct);
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const hasData = data.some(v => v > 0);
    
    productRevenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hasData ? labels : ['Aucune vente'],
            datasets: [{
                data: hasData ? data : [1],
                backgroundColor: hasData ? colors.slice(0, labels.length) : ['#e2e8f0'],
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
                            if (!hasData) return 'Ajoutez des commandes dans Admin';
                            return context.label + ': ' + context.parsed.toLocaleString('fr-FR') + ' €';
                        }
                    }
                }
            }
        }
    });
    
    ctx.parentElement.style.height = '300px';
}

function renderProductRevenueList() {
    const container = document.getElementById('productRevenueList');
    if (!container) return;
    
    const orders = getData('orders') || [];
    const products = getData('products') || [];
    
    const productStats = products.map(product => {
        let sales = 0;
        let revenue = 0;
        orders.filter(o => o.product === product.name && o.status === 'completed').forEach(o => {
            sales++;
            const amount = Number(o.amount);
            if (!isNaN(amount)) revenue += amount;
        });
        return { name: product.name, price: product.price, sales: sales, revenue: revenue };
    }).sort((a, b) => b.revenue - a.revenue);
    
    const totalRevenue = productStats.reduce((sum, p) => sum + p.revenue, 0) || 1;
    const icons = ['📊', '📈', '🚀', '⭐', '💎'];
    const colors = ['blue', 'purple', 'green', 'orange', 'red'];
    
    if (productStats.every(p => p.sales === 0)) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Aucune vente. Ajoutez des commandes dans Admin !</p>';
        return;
    }
    
    container.innerHTML = productStats.map((product, index) => `
        <div class="product-revenue-item">
            <div class="product-info">
                <div class="product-icon ${colors[index] || 'blue'}">${icons[index] || '📦'}</div>
                <div>
                    <span class="product-name">${product.name}</span>
                    <span class="product-sales">${product.sales} ventes</span>
                </div>
            </div>
            <div class="product-stats">
                <span class="product-amount">${product.revenue.toLocaleString('fr-FR')} €</span>
                <span class="product-percent positive">${Math.round(product.revenue / totalRevenue * 100)}%</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// PAGE PARAMÈTRES
// ============================================

function initSettingsPage() {
    // === THÈME ===
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
            } else if (theme === 'auto') {
                localStorage.setItem('dashboard-theme', 'auto');
                applyAutoTheme();
            }
        });
    });
    
    // === COULEURS ===
    const colorOptions = document.querySelectorAll('.color-option');
    const savedColor = localStorage.getItem('dashboard-color');
    if (savedColor) {
        applyColor(savedColor);
        colorOptions.forEach(btn => {
            btn.classList.toggle('active', btn.style.background === savedColor || btn.style.backgroundColor === savedColor);
        });
    }
    
    colorOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            colorOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const color = btn.style.background || btn.style.backgroundColor;
            applyColor(color);
            localStorage.setItem('dashboard-color', color);
            showSettingsToast('Couleur appliquée !');
        });
    });
    
    
    // === AVATAR ===
    const changeAvatarBtn = document.querySelector('.avatar-upload .secondary-btn');
    const currentAvatar = document.querySelector('.current-avatar');
    
    // Charger l'avatar sauvegardé
    if (currentAvatar) {
        const savedImage = localStorage.getItem('dashboard-avatar-image');
        const savedEmoji = localStorage.getItem('dashboard-avatar');
        const savedColor = localStorage.getItem('dashboard-avatar-color') || '#3b82f6';
        
        if (savedImage) {
            currentAvatar.style.background = `url(${savedImage}) center/cover`;
            currentAvatar.textContent = '';
        } else if (savedEmoji) {
            currentAvatar.style.background = savedColor;
            currentAvatar.textContent = savedEmoji;
        } else {
            // Utiliser la première lettre du nom
            const savedSettings = getData('settings');
            const firstLetter = savedSettings && savedSettings.userName ? savedSettings.userName.charAt(0).toUpperCase() : 'O';
            currentAvatar.style.background = savedColor;
            currentAvatar.textContent = firstLetter;
        }
    }
    
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            openAvatarModal();
        });
    }
    
    // === PROFIL ===
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const saveBtn = document.getElementById('saveProfileBtn');
    
    // Charger les données sauvegardées
    const savedSettings = getData('settings');
    if (savedSettings) {
        if (nameInput && savedSettings.userName) {
            nameInput.value = savedSettings.userName;
        }
        if (emailInput && savedSettings.userEmail) {
            emailInput.value = savedSettings.userEmail;
        }
    }
    
    // Bouton sauvegarder
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const newName = nameInput ? nameInput.value : '';
            const newEmail = emailInput ? emailInput.value : '';
            
            // Sauvegarder
            let settings = getData('settings') || {};
            settings.userName = newName;
            settings.userEmail = newEmail;
            setData('settings', settings);
            
            // Mettre à jour le nom dans la sidebar
            const userNameEl = document.querySelector('.user-name');
            if (userNameEl && newName) {
                userNameEl.textContent = newName;
            }
            
            // Feedback
            this.textContent = '✓ Sauvegardé !';
            this.style.background = 'var(--accent-green)';
            setTimeout(() => {
                this.textContent = 'Sauvegarder';
                this.style.background = '';
            }, 2000);
            
            showSettingsToast('Profil sauvegardé !');
        });
    }
    // === NOTIFICATIONS ===
    const notifToggle = document.getElementById('notifOrdersToggle');
    if (notifToggle) {
        // Charger l'état sauvegardé
        const notifEnabled = localStorage.getItem('dashboard-notif-orders') !== 'false';
        notifToggle.checked = notifEnabled;
        
        // Sauvegarder quand on change
        notifToggle.addEventListener('change', () => {
            localStorage.setItem('dashboard-notif-orders', notifToggle.checked);
            if (notifToggle.checked) {
                showSettingsToast('Notifications activées');
            } else {
                showSettingsToast('Notifications désactivées');
            }
        });
    }
    // === EXPORT DES DONNÉES ===
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const data = {
                orders: getData('orders') || [],
                users: getData('users') || [],
                products: getData('products') || [],
                settings: getData('settings') || {},
                exportDate: new Date().toISOString()
            };
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard-data-' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
            
            URL.revokeObjectURL(url);
            showSettingsToast('Données exportées !');
        });
    }

    // === IMPORT DES DONNÉES ===
    const importDataInput = document.getElementById('importDataInput');
    if (importDataInput) {
        importDataInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (!confirm('⚠️ Cela va remplacer toutes vos données actuelles. Continuer ?')) {
                        return;
                    }
                    
                    // Restaurer les données
                    if (data.orders) setData('orders', data.orders);
                    if (data.users) setData('users', data.users);
                    if (data.products) setData('products', data.products);
                    if (data.settings) setData('settings', data.settings);
                    
                    showSettingsToast('Données importées !');
                    
                    // Recharger la page pour appliquer
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                    
                } catch (error) {
                    alert('Erreur : fichier JSON invalide');
                }
            };
            reader.readAsText(file);
        });
    }
}

function applyColor(color) {
    const root = document.documentElement;
    
    // Convertir la couleur en RGB pour les variantes
    root.style.setProperty('--accent-blue', color);
    
    // Mettre à jour les éléments qui utilisent la couleur principale
    const style = document.createElement('style');
    style.id = 'custom-color-style';
    
    // Supprimer l'ancien style si existe
    const oldStyle = document.getElementById('custom-color-style');
    if (oldStyle) oldStyle.remove();
    
    style.textContent = `
        .primary-btn { background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}) !important; }
        .nav-item.active { background: linear-gradient(135deg, ${color}20, ${color}10) !important; border-left-color: ${color} !important; }
        .nav-item.active .nav-icon { color: ${color} !important; }
        .stat-icon.blue { background: ${color}20 !important; color: ${color} !important; }
        .admin-tab.active { background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}) !important; }
        .toggle-switch input:checked + .toggle-slider { background: ${color} !important; }
        .color-option.active { box-shadow: 0 0 0 3px ${color}40 !important; }
    `;
    
    document.head.appendChild(style);
}

function adjustColor(color, amount) {
    // Assombrir ou éclaircir une couleur
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function openAvatarModal() {
    const modal = document.createElement('div');
    modal.className = 'avatar-modal';
    modal.innerHTML = `
        <div class="avatar-modal-content">
            <div class="avatar-modal-header">
                <h3>Changer la photo de profil</h3>
                <button class="avatar-modal-close">✕</button>
            </div>
            <div class="avatar-modal-body">
                <div class="avatar-preview-container">
                    <div class="avatar-preview" id="avatarPreview">O</div>
                    <p class="avatar-preview-text">Aperçu</p>
                </div>
                
                <div class="avatar-upload-section">
                    <p>📷 Télécharger une photo :</p>
                    <label class="upload-btn">
                        <input type="file" id="avatarFileInput" accept="image/*" hidden>
                        <span>Choisir une image</span>
                    </label>
                </div>
                
                <div class="avatar-divider"><span>ou</span></div>
                
                <p>Choisissez un emoji :</p>
                <div class="avatar-options">
                    <div class="avatar-option" data-avatar="😀">😀</div>
                    <div class="avatar-option" data-avatar="😎">😎</div>
                    <div class="avatar-option" data-avatar="🚀">🚀</div>
                    <div class="avatar-option" data-avatar="💼">💼</div>
                    <div class="avatar-option" data-avatar="🎨">🎨</div>
                    <div class="avatar-option" data-avatar="💻">💻</div>
                    <div class="avatar-option" data-avatar="⭐">⭐</div>
                    <div class="avatar-option" data-avatar="🔥">🔥</div>
                </div>
                
                <p style="margin-top: 16px;">Couleur de fond :</p>
                <div class="avatar-colors">
                    <div class="avatar-color" data-color="#3b82f6" style="background: #3b82f6"></div>
                    <div class="avatar-color" data-color="#10b981" style="background: #10b981"></div>
                    <div class="avatar-color" data-color="#f59e0b" style="background: #f59e0b"></div>
                    <div class="avatar-color" data-color="#8b5cf6" style="background: #8b5cf6"></div>
                    <div class="avatar-color" data-color="#ef4444" style="background: #ef4444"></div>
                    <div class="avatar-color" data-color="#06b6d4" style="background: #06b6d4"></div>
                </div>
            </div>
            <div class="avatar-modal-footer">
                <button class="secondary-btn avatar-cancel">Annuler</button>
                <button class="primary-btn avatar-save">Sauvegarder</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    let selectedAvatar = localStorage.getItem('dashboard-avatar') || 'O';
    let selectedColor = localStorage.getItem('dashboard-avatar-color') || '#3b82f6';
    let selectedImage = localStorage.getItem('dashboard-avatar-image') || null;
    
    const preview = modal.querySelector('#avatarPreview');
    
    // Afficher l'avatar actuel
    updateAvatarPreview(preview, selectedAvatar, selectedColor, selectedImage);
    
    // Upload de fichier
    const fileInput = modal.querySelector('#avatarFileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) {
                alert('Image trop grande ! Maximum 500 Ko.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedImage = event.target.result;
                selectedAvatar = null;
                updateAvatarPreview(preview, selectedAvatar, selectedColor, selectedImage);
                
                // Désélectionner les emojis
                modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Sélection emoji
    modal.querySelectorAll('.avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedAvatar = opt.getAttribute('data-avatar');
            selectedImage = null;
            updateAvatarPreview(preview, selectedAvatar, selectedColor, selectedImage);
        });
    });
    
    // Sélection couleur
    modal.querySelectorAll('.avatar-color').forEach(opt => {
        opt.addEventListener('click', () => {
            modal.querySelectorAll('.avatar-color').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedColor = opt.getAttribute('data-color');
            updateAvatarPreview(preview, selectedAvatar, selectedColor, selectedImage);
        });
    });
    
    // Fermer
    modal.querySelector('.avatar-modal-close').addEventListener('click', () => closeAvatarModal(modal));
    modal.querySelector('.avatar-cancel').addEventListener('click', () => closeAvatarModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAvatarModal(modal);
    });
    
    // Sauvegarder
    modal.querySelector('.avatar-save').addEventListener('click', () => {
        if (selectedImage) {
            localStorage.setItem('dashboard-avatar-image', selectedImage);
            localStorage.removeItem('dashboard-avatar');
        } else {
            localStorage.setItem('dashboard-avatar', selectedAvatar);
            localStorage.removeItem('dashboard-avatar-image');
        }
        localStorage.setItem('dashboard-avatar-color', selectedColor);
        
        // Mettre à jour tous les avatars sur la page
        document.querySelectorAll('.user-avatar, .current-avatar').forEach(el => {
            updateAvatarPreview(el, selectedAvatar, selectedColor, selectedImage);
        });
        
        closeAvatarModal(modal);
        showSettingsToast('Avatar mis à jour !');
    });
}

function updateAvatarPreview(element, avatar, color, image) {
    if (image) {
        element.style.backgroundImage = `url(${image})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.textContent = '';
        element.style.background = `url(${image}) center/cover`;
    } else {
        element.style.backgroundImage = 'none';
        element.style.background = color;
        element.textContent = avatar || 'O';
    }
}

function closeAvatarModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function showSettingsToast(message) {
    let toast = document.querySelector('.settings-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'settings-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = '✓ ' + message;
    toast.classList.add('show');
    
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// ============================================
// PAGE ADMIN
// ============================================

function initAdminPage() {
    initializeData();
    initAdminTabs();
    initOrderForm();
    initAdminUserForm();
    initProductForm();
    initSettingsForm();
    initDangerZone();
    
    renderAdminOrders();
    renderAdminUsers();
    renderAdminProducts();
    loadSettingsForm();
    updateStatsPreview();
}

function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const panelId = 'panel-' + tab.getAttribute('data-tab');
            document.getElementById(panelId).classList.add('active');
        });
    });
}

function initOrderForm() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    const productSelect = document.getElementById('orderProduct');
    const products = getData('products') || [];
    
    productSelect.innerHTML = '<option value="">Sélectionner...</option>';
    products.forEach(p => {
        productSelect.innerHTML += `<option value="${p.name}" data-price="${p.price}">${p.name} (${p.price}€)</option>`;
    });
    
    productSelect.addEventListener('change', () => {
        const selected = productSelect.options[productSelect.selectedIndex];
        const price = selected.getAttribute('data-price');
        if (price) document.getElementById('orderAmount').value = price;
    });
    
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const orders = getData('orders') || [];
        const newOrder = {
            id: '#' + (1000 + orders.length + 1),
            client: document.getElementById('orderClient').value,
            email: document.getElementById('orderEmail').value,
            product: document.getElementById('orderProduct').value,
            amount: parseFloat(document.getElementById('orderAmount').value),
            status: document.getElementById('orderStatus').value,
            date: document.getElementById('orderDate').value
        };
        
        orders.unshift(newOrder);
        setData('orders', orders);
        
        form.reset();
        document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        
        renderAdminOrders();
        updateStatsPreview();
        refreshNotifications();
        showToast('Commande ajoutée !');
    });
}

function renderAdminOrders() {
    const tbody = document.getElementById('adminOrdersBody');
    const countEl = document.getElementById('ordersCount');
    if (!tbody) return;
    
    const orders = getData('orders') || [];
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-empty">
                    <div class="admin-empty-icon">📦</div>
                    <div class="admin-empty-text">Aucune commande. Ajoutez-en une !</div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.client}</td>
                <td>${order.product}</td>
                <td><strong>${order.amount} €</strong></td>
                <td><span class="status-badge ${order.status}"><span class="status-dot"></span>${getStatusLabel(order.status)}</span></td>
                <td>${formatDate(order.date)}</td>
                <td class="actions">
                    <button class="action-btn delete" onclick="deleteOrder(${order.id ? "'" + order.id + "'" : orders.indexOf(order)})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
    
    if (countEl) countEl.textContent = `${orders.length} commande${orders.length > 1 ? 's' : ''}`;
}

function deleteOrder(id) {
    if (!confirm('Supprimer cette commande ?')) return;
    
    let orders = getData('orders') || [];
    orders = orders.filter((o, index) => o.id !== id && index !== id);
    setData('orders', orders);
    
    renderAdminOrders();
    updateStatsPreview();
    showToast('Commande supprimée');
}

function initAdminUserForm() {
    const form = document.getElementById('adminUserForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const users = getData('users') || [];
        const newUser = {
            id: Date.now(),
            name: document.getElementById('adminUserName').value,
            email: document.getElementById('adminUserEmail').value,
            plan: document.getElementById('adminUserPlan').value,
            status: document.getElementById('adminUserStatus').value,
            date: new Date().toISOString().split('T')[0]
        };
        
        users.unshift(newUser);
        setData('users', users);
        
        form.reset();
        renderAdminUsers();
        updateStatsPreview();
        showToast('Utilisateur ajouté !');
    });
}

function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersBody');
    const countEl = document.getElementById('adminUsersCount');
    if (!tbody) return;
    
    const users = getData('users') || [];
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="admin-empty">
                    <div class="admin-empty-icon">👥</div>
                    <div class="admin-empty-text">Aucun utilisateur. Ajoutez-en un !</div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="plan-badge ${user.plan}">${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span></td>
                <td><span class="status-badge ${user.status === 'active' ? 'completed' : 'pending'}"><span class="status-dot"></span>${user.status === 'active' ? 'Actif' : 'En attente'}</span></td>
                <td class="actions">
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
    
    if (countEl) countEl.textContent = `${users.length} utilisateur${users.length > 1 ? 's' : ''}`;
}

function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    
    let users = getData('users') || [];
    users = users.filter(u => u.id !== id);
    setData('users', users);
    
    renderAdminUsers();
    updateStatsPreview();
    showToast('Utilisateur supprimé');
}

function initProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const products = getData('products') || [];
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value)
        };
        
        products.push(newProduct);
        setData('products', products);
        
        form.reset();
        renderAdminProducts();
        showToast('Produit ajouté !');
    });
}

function renderAdminProducts() {
    const tbody = document.getElementById('adminProductsBody');
    const countEl = document.getElementById('productsCount');
    if (!tbody) return;
    
    const products = getData('products') || [];
    const orders = getData('orders') || [];
    
    tbody.innerHTML = products.map(product => {
        let sales = 0;
        let revenue = 0;
        orders.filter(o => o.product === product.name && o.status === 'completed').forEach(o => {
            sales++;
            const amount = Number(o.amount);
            if (!isNaN(amount)) revenue += amount;
        });
        
        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.price} €</td>
                <td>${sales}</td>
                <td><strong>${revenue} €</strong></td>
                <td class="actions">
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (countEl) countEl.textContent = `${products.length} produit${products.length > 1 ? 's' : ''}`;
}

function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    
    let products = getData('products') || [];
    products = products.filter(p => p.id !== id);
    setData('products', products);
    
    renderAdminProducts();
    showToast('Produit supprimé');
}

function initSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const settings = {
            appName: document.getElementById('settingsAppName').value,
            appBadge: document.getElementById('settingsAppBadge').value,
            userName: document.getElementById('settingsUserName').value,
            userEmail: document.getElementById('settingsUserEmail').value
        };
        
        setData('settings', settings);
        showToast('Paramètres sauvegardés !');
    });
}

function loadSettingsForm() {
    const settings = getData('settings');
    if (!settings) return;
    
    const appNameEl = document.getElementById('settingsAppName');
    const appBadgeEl = document.getElementById('settingsAppBadge');
    const userNameEl = document.getElementById('settingsUserName');
    const userEmailEl = document.getElementById('settingsUserEmail');
    
    if (appNameEl) appNameEl.value = settings.appName || '';
    if (appBadgeEl) appBadgeEl.value = settings.appBadge || '';
    if (userNameEl) userNameEl.value = settings.userName || '';
    if (userEmailEl) userEmailEl.value = settings.userEmail || '';
}

function initDangerZone() {
    const resetBtn = document.getElementById('resetDataBtn');
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!confirm('⚠️ Supprimer TOUTES les données ? Cette action est irréversible.')) return;
            
            setData('orders', []);
            setData('users', []);
            
            renderAdminOrders();
            renderAdminUsers();
            updateStatsPreview();
            showToast('Données réinitialisées');
        });
    }
    
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', () => {
            loadDemoData();
            renderAdminOrders();
            renderAdminUsers();
            renderAdminProducts();
            updateStatsPreview();
            showToast('Données de démo chargées !');
        });
    }
}

function loadDemoData() {
    // Générer des dates récentes (ce mois et le mois dernier)
    const today = new Date();
    const thisMonth = today.toISOString().split('T')[0].slice(0, 7); // "2025-12"
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().split('T')[0].slice(0, 7);
    
    const demoOrders = [
        { id: '#1234', client: 'Marie Dupont', email: 'marie@email.com', product: 'Dashboard Pro', amount: 99, status: 'completed', date: thisMonth + '-15' },
        { id: '#1233', client: 'Jean Martin', email: 'jean@email.com', product: 'Dashboard Starter', amount: 49, status: 'completed', date: thisMonth + '-14' },
        { id: '#1232', client: 'Sophie Bernard', email: 'sophie@email.com', product: 'Dashboard Business', amount: 149, status: 'processing', date: thisMonth + '-13' },
        { id: '#1231', client: 'Pierre Dubois', email: 'pierre@email.com', product: 'Dashboard Pro', amount: 99, status: 'completed', date: thisMonth + '-10' },
        { id: '#1230', client: 'Claire Moreau', email: 'claire@email.com', product: 'Dashboard Business', amount: 149, status: 'completed', date: lastMonth + '-28' },
        { id: '#1229', client: 'Lucas Petit', email: 'lucas@email.com', product: 'Dashboard Starter', amount: 49, status: 'pending', date: lastMonth + '-25' },
        { id: '#1228', client: 'Emma Laurent', email: 'emma@email.com', product: 'Dashboard Pro', amount: 99, status: 'completed', date: lastMonth + '-20' }
    ];
    setData('orders', demoOrders);
    
    const demoUsers = [
        { id: 1, name: 'Marie Dupont', email: 'marie@email.com', plan: 'pro', status: 'active', date: thisMonth + '-15' },
        { id: 2, name: 'Jean Martin', email: 'jean@email.com', plan: 'starter', status: 'active', date: thisMonth + '-14' },
        { id: 3, name: 'Sophie Bernard', email: 'sophie@email.com', plan: 'business', status: 'pending', date: thisMonth + '-13' },
        { id: 4, name: 'Pierre Dubois', email: 'pierre@email.com', plan: 'pro', status: 'active', date: lastMonth + '-28' },
        { id: 5, name: 'Claire Moreau', email: 'claire@email.com', plan: 'business', status: 'active', date: lastMonth + '-20' }
    ];
    setData('users', demoUsers);
    
    const demoProducts = [
        { id: 1, name: 'Dashboard Starter', price: 49 },
        { id: 2, name: 'Dashboard Pro', price: 99 },
        { id: 3, name: 'Dashboard Business', price: 149 }
    ];
    setData('products', demoProducts);
}
function updateStatsPreview() {
    const stats = calculateStats();
    
    const revenueEl = document.getElementById('previewRevenue');
    const ordersEl = document.getElementById('previewOrders');
    const averageEl = document.getElementById('previewAverage');
    
    if (revenueEl) revenueEl.textContent = stats.revenue.toLocaleString('fr-FR') + ' €';
    if (ordersEl) ordersEl.textContent = stats.orders;
    if (averageEl) averageEl.textContent = Math.round(stats.averageOrder).toLocaleString('fr-FR') + ' €';
}

function showToast(message) {
    let toast = document.querySelector('.admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = '✓ ' + message;
    toast.classList.add('show');
    
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

// ============================================
// NOTIFICATIONS
// ============================================

let notifications = [];

function initNotifications() {
    const notifEnabled = localStorage.getItem('dashboard-notif-orders') !== 'false';
    
    // Récupérer les IDs des notifications déjà lues
    let readNotifications = [];
    try {
        readNotifications = JSON.parse(localStorage.getItem('dashboard-notif-read')) || [];
    } catch(e) {
        readNotifications = [];
    }
    
    if (notifEnabled) {
        const orders = getData('orders') || [];
        
        notifications = orders.slice(0, 5).map((order, index) => {
            const notifId = order.id || '#' + (1000 + index);
            return {
                id: notifId,
                type: 'order',
                icon: '✓',
                text: `<strong>Commande ${notifId}</strong> de ${order.client} pour ${order.amount}€`,
                time: 'Récemment',
                unread: !readNotifications.includes(notifId)
            };
        });
        
        if (notifications.length === 0) {
            notifications = [
                { id: 'welcome', type: 'info', icon: '👋', text: '<strong>Bienvenue !</strong> Ajoutez des commandes dans Admin', time: 'Maintenant', unread: !readNotifications.includes('welcome') }
            ];
        }
    } else {
        notifications = [
            { id: 'disabled', type: 'info', icon: '🔕', text: '<strong>Notifications désactivées</strong><br>Activez-les dans Paramètres', time: '', unread: false }
        ];
    }
    
    const btn = document.getElementById('notificationsBtn');
    const panel = document.getElementById('notificationsPanel');
    const markAllBtn = document.getElementById('markAllRead');
    
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            // Marquer toutes comme lues
            notifications.forEach(n => { n.unread = false; });
            
            // Sauvegarder les IDs lues dans localStorage
            const allIds = notifications.map(n => n.id);
            localStorage.setItem('dashboard-notif-read', JSON.stringify(allIds));
            
            renderNotifications();
            markAllBtn.textContent = '✓ Fait !';
            setTimeout(() => { markAllBtn.textContent = 'Tout marquer lu'; }, 1500);
        });
    }
    
    renderNotifications();
}

function refreshNotifications() {
    const notifEnabled = localStorage.getItem('dashboard-notif-orders') !== 'false';
    
    let readNotifications = [];
    try {
        readNotifications = JSON.parse(localStorage.getItem('dashboard-notif-read')) || [];
    } catch(e) {
        readNotifications = [];
    }
    
    if (notifEnabled) {
        const orders = getData('orders') || [];
        
        notifications = orders.slice(0, 5).map((order, index) => {
            const notifId = order.id || '#' + (1000 + index);
            return {
                id: notifId,
                type: 'order',
                icon: '✓',
                text: `<strong>Commande ${notifId}</strong> de ${order.client} pour ${order.amount}€`,
                time: 'Récemment',
                unread: !readNotifications.includes(notifId)
            };
        });
        
        if (notifications.length === 0) {
            notifications = [
                { id: 'welcome', type: 'info', icon: '👋', text: '<strong>Bienvenue !</strong> Ajoutez des commandes dans Admin', time: 'Maintenant', unread: !readNotifications.includes('welcome') }
            ];
        }
    } else {
        notifications = [
            { id: 'disabled', type: 'info', icon: '🔕', text: '<strong>Notifications désactivées</strong><br>Activez-les dans Paramètres', time: '', unread: false }
        ];
    }
    
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationsBadge');
    if (!list) return;
    
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
    
    const unreadCount = notifications.filter(n => n.unread).length;
    if (badge) {
        badge.textContent = unreadCount;
        badge.classList.toggle('hidden', unreadCount === 0);
    }
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .admin-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: var(--accent-green);
        color: white;
        border-radius: 12px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    .admin-toast.show {
        transform: translateY(0);
        opacity: 1;
    }
    @keyframes shake {
        0%, 100% { transform: rotate(0); }
        25% { transform: rotate(-10deg); }
        50% { transform: rotate(10deg); }
        75% { transform: rotate(-10deg); }
    }
`;
document.head.appendChild(dynamicStyles);

// ============================================
// INITIALISATION PRINCIPALE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNotifications();
    initPageNavigation();
});