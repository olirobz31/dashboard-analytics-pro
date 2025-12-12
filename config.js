/* ============================================
   DASHBOARD ANALYTICS PRO - CONFIGURATION
   ============================================
   
   👋 Bienvenue ! Ce fichier contient toutes les 
   données de votre dashboard.
   
   Modifiez les valeurs ci-dessous pour 
   personnaliser votre tableau de bord.
   
   ============================================ */

const CONFIG = {

    // ==========================================
    // 🎨 INFORMATIONS GÉNÉRALES
    // ==========================================
    
    app: {
        name: "Analytics",           // Nom affiché dans le logo
        badge: "PRO",                // Badge à côté du logo (ou "" pour masquer)
        logo: "📊",                  // Emoji ou laisser vide si vous utilisez une image
        // logoImage: "img/logo.png" // Décommentez pour utiliser une image
    },
    
    user: {
        name: "Olive",               // Votre nom
        avatar: "O",                 // Initiale pour l'avatar (1-2 lettres)
        email: "olive@example.com"   // Votre email
    },


    // ==========================================
    // 📊 STATISTIQUES PRINCIPALES (Dashboard)
    // ==========================================
    
    stats: {
        revenus: {
            value: 99999,
            label: "Revenus (€)",
            trend: "+12.5%",
            trendType: "positive",   // "positive", "negative", ou "neutral"
            icon: "💶",
            color: "blue"            // "blue", "green", "orange", "purple"
        },
        utilisateurs: {
            value: 1284,
            label: "Utilisateurs",
            trend: "+8.2%",
            trendType: "positive",
            icon: "👥",
            color: "green"
        },
        commandes: {
            value: 356,
            label: "Commandes",
            trend: "+5.1%",
            trendType: "positive",
            icon: "🛒",
            color: "orange"
        },
        note: {
            value: 4.8,
            label: "Note moyenne",
            trend: "+0.2",
            trendType: "neutral",
            icon: "⭐",
            color: "purple"
        }
    },


    // ==========================================
    // 📈 GRAPHIQUE REVENUS MENSUELS
    // ==========================================
    
    revenueChart: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        data: [1200, 1900, 1500, 2800, 2200, 3100, 2800, 3500, 4200, 3800, 4500, 5200],
        label: "Revenus (€)"
    },


    // ==========================================
    // 🍩 GRAPHIQUE SOURCES DE TRAFIC
    // ==========================================
    
    trafficChart: {
        labels: ['Recherche', 'Direct', 'Réseaux sociaux', 'Référents'],
        data: [45, 25, 20, 10],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    },


    // ==========================================
    // ⚡ ACTIVITÉ RÉCENTE
    // ==========================================
    
    activities: [
        {
            icon: "✓",
            iconColor: "green",      // "green", "blue", "orange"
            text: "Nouvelle commande #1234",
            time: "Il y a 5 min",
            amount: "+79€"           // Optionnel, laisser "" si pas de montant
        },
        {
            icon: "👤",
            iconColor: "blue",
            text: "Nouvel utilisateur inscrit",
            time: "Il y a 12 min",
            amount: ""
        },
        {
            icon: "⭐",
            iconColor: "orange",
            text: "Nouvel avis 5 étoiles",
            time: "Il y a 1h",
            amount: ""
        },
        {
            icon: "✓",
            iconColor: "green",
            text: "Nouvelle commande #1233",
            time: "Il y a 2h",
            amount: "+49€"
        }
    ],


    // ==========================================
    // 📋 TABLEAU DES COMMANDES
    // ==========================================
    
    orders: [
        { id: '#1234', client: 'Marie Dupont', product: 'Dashboard Pro', amount: 149, status: 'completed', date: '2024-01-15' },
        { id: '#1233', client: 'Jean Martin', product: 'Dashboard Starter', amount: 49, status: 'completed', date: '2024-01-15' },
        { id: '#1232', client: 'Sophie Bernard', product: 'Dashboard Business', amount: 249, status: 'processing', date: '2024-01-14' },
        { id: '#1231', client: 'Pierre Dubois', product: 'Dashboard Pro', amount: 149, status: 'completed', date: '2024-01-14' },
        { id: '#1230', client: 'Claire Moreau', product: 'Dashboard Starter', amount: 49, status: 'pending', date: '2024-01-13' },
        { id: '#1229', client: 'Lucas Petit', product: 'Dashboard Business', amount: 249, status: 'completed', date: '2024-01-13' },
        { id: '#1228', client: 'Emma Laurent', product: 'Dashboard Pro', amount: 149, status: 'cancelled', date: '2024-01-12' },
        { id: '#1227', client: 'Hugo Roux', product: 'Dashboard Starter', amount: 49, status: 'completed', date: '2024-01-12' },
        { id: '#1226', client: 'Léa Simon', product: 'Dashboard Pro', amount: 149, status: 'completed', date: '2024-01-11' },
        { id: '#1225', client: 'Nathan Michel', product: 'Dashboard Business', amount: 249, status: 'processing', date: '2024-01-11' },
        { id: '#1224', client: 'Chloé Garcia', product: 'Dashboard Starter', amount: 49, status: 'completed', date: '2024-01-10' },
        { id: '#1223', client: 'Théo Martinez', product: 'Dashboard Pro', amount: 149, status: 'completed', date: '2024-01-10' },
        { id: '#1222', client: 'Camille Lopez', product: 'Dashboard Business', amount: 249, status: 'pending', date: '2024-01-09' },
        { id: '#1221', client: 'Maxime Thomas', product: 'Dashboard Starter', amount: 49, status: 'completed', date: '2024-01-09' },
        { id: '#1220', client: 'Manon Robert', product: 'Dashboard Pro', amount: 149, status: 'completed', date: '2024-01-08' }
    ],
    
    // Statuts possibles: 'completed', 'pending', 'processing', 'cancelled'


    // ==========================================
    // 🔔 NOTIFICATIONS
    // ==========================================
    
    notifications: [
        {
            type: 'order',           // 'order', 'user', 'alert', 'review', 'info'
            icon: '✓',
            text: '<strong>Nouvelle commande #1234</strong> de Marie Dupont pour 149€',
            time: 'Il y a 2 min',
            unread: true
        },
        {
            type: 'user',
            icon: '👤',
            text: '<strong>Nouvel utilisateur</strong> Jean Martin vient de s\'inscrire',
            time: 'Il y a 15 min',
            unread: true
        },
        {
            type: 'alert',
            icon: '⚠️',
            text: '<strong>Stock faible</strong> Dashboard Business (3 restants)',
            time: 'Il y a 1h',
            unread: true
        },
        {
            type: 'review',
            icon: '⭐',
            text: '<strong>Nouvel avis 5 étoiles</strong> "Excellent produit, très pro !"',
            time: 'Il y a 2h',
            unread: true
        },
        {
            type: 'info',
            icon: '📊',
            text: '<strong>Rapport hebdomadaire</strong> prêt à être consulté',
            time: 'Il y a 3h',
            unread: false
        }
    ],


    // ==========================================
    // 📊 PAGE STATISTIQUES
    // ==========================================
    
    statisticsPage: {
        stats: {
            vues: { value: 45230, label: "Vues totales", trend: "+18.2%", trendType: "positive", icon: "👁️", color: "blue" },
            conversion: { value: 3.2, label: "Taux conversion %", trend: "+0.8%", trendType: "positive", icon: "🎯", color: "green" },
            tempsMoyen: { value: 4.5, label: "Temps moyen (min)", trend: "+1.2", trendType: "positive", icon: "⏱️", color: "orange" },
            rebond: { value: 23, label: "Taux rebond %", trend: "-5.3%", trendType: "positive", icon: "📉", color: "purple" }
        },
        topPages: [
            { name: '/dashboard', views: 12450, percent: 85 },
            { name: '/products', views: 9320, percent: 65 },
            { name: '/pricing', views: 6890, percent: 48 },
            { name: '/contact', views: 4560, percent: 32 },
            { name: '/about', views: 3210, percent: 25 }
        ],
        countries: [
            { flag: '🇫🇷', name: 'France', percent: '45%' },
            { flag: '🇧🇪', name: 'Belgique', percent: '18%' },
            { flag: '🇨🇭', name: 'Suisse', percent: '15%' },
            { flag: '🇨🇦', name: 'Canada', percent: '12%' },
            { flag: '🇲🇦', name: 'Maroc', percent: '10%' }
        ],
        devices: {
            labels: ['Desktop', 'Mobile', 'Tablette'],
            data: [58, 35, 7]
        }
    },


    // ==========================================
    // 👥 PAGE UTILISATEURS
    // ==========================================
    
    users: [
        { id: 1, name: 'Marie Dupont', email: 'marie.dupont@email.com', plan: 'business', status: 'active', date: '2024-01-15' },
        { id: 2, name: 'Jean Martin', email: 'jean.martin@email.com', plan: 'pro', status: 'active', date: '2024-01-14' },
        { id: 3, name: 'Sophie Bernard', email: 'sophie.b@email.com', plan: 'starter', status: 'pending', date: '2024-01-14' },
        { id: 4, name: 'Pierre Dubois', email: 'p.dubois@email.com', plan: 'pro', status: 'active', date: '2024-01-13' },
        { id: 5, name: 'Claire Moreau', email: 'claire.m@email.com', plan: 'business', status: 'active', date: '2024-01-13' },
        { id: 6, name: 'Lucas Petit', email: 'lucas.petit@email.com', plan: 'starter', status: 'active', date: '2024-01-12' },
        { id: 7, name: 'Emma Laurent', email: 'emma.l@email.com', plan: 'pro', status: 'pending', date: '2024-01-12' },
        { id: 8, name: 'Hugo Roux', email: 'hugo.roux@email.com', plan: 'business', status: 'active', date: '2024-01-11' },
        { id: 9, name: 'Léa Simon', email: 'lea.simon@email.com', plan: 'starter', status: 'active', date: '2024-01-11' },
        { id: 10, name: 'Nathan Michel', email: 'n.michel@email.com', plan: 'pro', status: 'active', date: '2024-01-10' }
    ],
    
    // Plans possibles: 'starter', 'pro', 'business'
    // Statuts possibles: 'active', 'pending'


    // ==========================================
    // 💰 PAGE REVENUS
    // ==========================================
    
    revenuePage: {
        stats: {
            revenusMois: { value: 24580, label: "Revenus ce mois (€)", trend: "+12.5%", trendType: "positive", icon: "💶", color: "blue", highlight: true },
            revenusAnnuels: { value: 156890, label: "Revenus annuels (€)", trend: "+28.3%", trendType: "positive", icon: "📈", color: "green" },
            panierMoyen: { value: 89, label: "Panier moyen (€)", trend: "+5.2%", trendType: "positive", icon: "🎫", color: "orange" },
            recurrence: { value: 67, label: "Récurrence %", trend: "+3.1%", trendType: "positive", icon: "🔄", color: "purple" }
        },
        monthlyData: [8500, 12200, 9800, 15600, 14200, 18900, 16500, 21200, 19800, 24100, 22500, 24580],
        products: [
            { name: 'Dashboard Business', icon: '📊', iconColor: 'blue', sales: 124, amount: 30876, percent: 42 },
            { name: 'Dashboard Pro', icon: '📈', iconColor: 'purple', sales: 256, amount: 38144, percent: 35 },
            { name: 'Dashboard Starter', icon: '🚀', iconColor: 'green', sales: 389, amount: 19061, percent: 23 }
        ]
    }

};