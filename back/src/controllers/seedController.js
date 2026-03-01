const mongoose = require('mongoose');
const CategoryProduct = require('../models/CategoryProduct');
const CategoryShop = require('../models/CategoryShop');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── Seed Users Logic ────────────────────────────────────────────────────────

const seedUsersLogic = async () => {
    console.log('🧹 Clearing existing users...');
    await User.deleteMany({});

    console.log('🌱 Creating users...');

    // 1. Admin
    const adminUser = await User.create({
        role: 'admin',
        profile: {
            firstname: 'Super',
            lastname: 'Admin',
            email: 'admin@grosserie.com',
            password_hash: 'admin123',
            phone: '0123456789'
        }
    });
    console.log(`👤 Admin created: ${adminUser.profile.email}`);

    // 2. Shop Users
    const shopConfig = [
        { brand: 'maki', manager: 'Tahina', email: 'maki@mail.com' },
        { brand: 'supermaki', manager: 'Nirina', email: 'supermaki@mail.com' },
        { brand: 'jumboscore', manager: 'Andry', email: 'jumboscore@mail.com' },
        { brand: 'massin', manager: 'Mamy', email: 'massin@mail.com' },
        { brand: 'oceantrade', manager: 'Rakoto', email: 'oceantrade@mail.com' },
        { brand: 'librairie', manager: 'Fanja', email: 'librairie@mail.com' },
        { brand: 'citysport', manager: 'Lova', email: 'citysport@mail.com' }
    ];
    const shopUsers = [];

    for (const config of shopConfig) {
        const shopUser = await User.create({
            role: 'shop',
            profile: {
                firstname: config.manager,
                lastname: 'Manager',
                email: config.email,
                password_hash: `${config.brand}123`,
                phone: `034${Math.floor(1000000 + Math.random() * 9000000)}`
            }
        });
        shopUsers.push(shopUser);
        console.log(`👤 Shop User created: ${shopUser.profile.email}`);
    }

    // 3. Buyer
    const buyerUser = await User.create({
        role: 'buyer',
        profile: {
            firstname: 'John',
            lastname: 'Doe',
            email: 'buyer@grosserie.com',
            password_hash: 'buyer123',
            phone: '0654321987'
        }
    });
    console.log(`👤 Buyer created: ${buyerUser.profile.email}`);

    return { admin: adminUser, shopUsers, buyer: buyerUser };
};

// ─── Seed Data Logic ─────────────────────────────────────────────────────────

const categoriesList = [
    { name: 'Vêtements', description: 'Mode et habillement pour tous' },
    { name: 'Électronique', description: 'Gadgets et appareils électroniques' },
    { name: 'Alimentation', description: 'Produits alimentaires et épicerie' },
    { name: 'Maison & Cuisine', description: 'Équipements pour la maison et la cuisine' },
    { name: 'Beauté & Santé', description: 'Produits de soin et de beauté' },
    { name: 'Sports & Loisirs', description: 'Équipements sportifs et loisirs' },
    { name: 'Jouets & Jeux', description: 'Jeux pour enfants et adultes' },
    { name: 'Livres', description: 'Librairie et papeterie' },
    { name: 'Jardin & Bricolage', description: 'Outils et accessoires de jardinage' },
    { name: 'Informatique', description: 'Ordinateurs et périphériques' }
];

const shopsList = [
    {
        name: 'Maki Company',
        description: 'Vêtements identitaires de Madagascar et Bien-être',
        category: 'Vêtements',
        products: [
            { name: 'T-shirt Maki Classic', price: 45000, description: 'T-shirt 100% coton, motif lémurien' },
            { name: 'Polo Madagascar', price: 65000, description: 'Polo élégant brodé' },
            { name: 'Short de plage', price: 35000, description: 'Short léger pour les vacances' },
            { name: 'Huile de coco vierge', price: 25000, description: 'Soin naturel pour la peau', category: 'Beauté & Santé' },
            { name: 'Savon artisanal Vanille', price: 8500, description: 'Savon parfumé aux extraits naturels', category: 'Beauté & Santé' },
            { name: 'Sac en raphia', price: 55000, description: 'Artisanat local revisité' },
            { name: 'Baume à lèvres Coco', price: 12000, description: 'Hydratation intense', category: 'Beauté & Santé' },
            { name: 'Pareo imprimé', price: 40000, description: 'Pareo coloré multifonction' },
            { name: 'Sandales en cuir', price: 75000, description: 'Sandales artisanales' },
            { name: 'Sweat à capuche', price: 120000, description: 'Sweat chaud' },
            { name: 'Boule à neige Madagascar', price: 15000, description: 'Souvenir local', category: 'Maison & Cuisine' },
            { name: 'Carnet en papier Antaimoro', price: 12000, description: 'Papier traditionnel', category: 'Livres' },
            { name: 'Parfum Ylang-Ylang', price: 45000, description: 'Essence de Madagascar', category: 'Beauté & Santé' }
        ]
    },
    {
        name: 'Supermaki',
        description: 'Alimentation et Petit Équipement',
        category: 'Alimentation',
        products: [
            { name: 'Vary Gasy (5kg)', price: 18000, description: 'Riz local parfumé' },
            { name: 'Huile Fortune (1L)', price: 10500, description: 'Huile végétale' },
            { name: 'Poêle antiadhésive', price: 45000, description: 'Cuisine facile', category: 'Maison & Cuisine' },
            { name: 'Café de Madagascar', price: 12000, description: 'Café arabica moulu' },
            { name: 'Shampooing Familial', price: 18000, description: 'Soin des cheveux', category: 'Beauté & Santé' },
            { name: 'Dentifrice fraicheur', price: 5000, description: 'Hygiène dentaire', category: 'Beauté & Santé' },
            { name: 'Farine de blé (1kg)', price: 5500, description: 'Essentiel pâtisserie' },
            { name: 'Set de 3 Spatules', price: 15000, description: 'Ustensiles bois', category: 'Maison & Cuisine' },
            { name: 'Œufs (30)', price: 22000, description: 'Frais du jour' },
            { name: 'Lait concentré', price: 4500, description: 'Sucré et onctueux' },
            { name: 'Ampoule LED', price: 8500, description: 'Économie d\'énergie', category: 'Maison & Cuisine' },
            { name: 'Piles AA (x4)', price: 12000, description: 'Alcalines', category: 'Électronique' }
        ]
    },
    {
        name: 'Jumbo Score',
        description: 'Hyper-diversifié : Alimentation, Maison, Beauté',
        category: 'Alimentation',
        products: [
            { name: 'Chocolat Robert 70%', price: 8500, description: 'Prestige noir' },
            { name: 'Riz Blanc (5kg)', price: 22000, description: 'Long grain' },
            { name: 'Aspirateur puissant', price: 350000, description: 'Entretien maison', category: 'Maison & Cuisine' },
            { name: 'Crème solaire (Indice 50)', price: 45000, description: 'Protection intense', category: 'Beauté & Santé' },
            { name: 'Puzzle Madagascar 1000pcs', price: 55000, description: 'Divertissement', category: 'Jouets & Jeux' },
            { name: 'Service de table (12pcs)', price: 180000, description: 'Céramique blanche', category: 'Maison & Cuisine' },
            { name: 'Peluche Lémurien', price: 35000, description: 'Doudou local', category: 'Jouets & Jeux' },
            { name: 'Savon Madame Chiffon', price: 2500, description: 'Traditionnel' },
            { name: 'Lessive en poudre', price: 12500, description: 'Efficace' },
            { name: 'Masque à l\'argile', price: 28000, description: 'Soin visage', category: 'Beauté & Santé' },
            { name: 'Tondeuse à gazon', price: 850000, description: 'Pour votre jardin', category: 'Jardin & Bricolage' },
            { name: 'Arrosoir 10L', price: 25000, description: 'Plastique robuste', category: 'Jardin & Bricolage' }
        ]
    },
    {
        name: 'Mass\'In',
        description: 'Informatique et High-Tech',
        category: 'Informatique',
        products: [
            { name: 'Clavier bureautique', price: 45000, description: 'Standard USB' },
            { name: 'Souris sans fil', price: 35000, description: 'Ergonomique' },
            { name: 'Écouteurs sans fil', price: 120000, description: 'Son pur', category: 'Électronique' },
            { name: 'Disque Dur Externe 1TB', price: 280000, description: 'Storage' },
            { name: 'Chargeur Rapide 45W', price: 85000, description: 'USB-C', category: 'Électronique' },
            { name: 'Clé USB 64GB', price: 35000, description: 'Compact' },
            { name: 'Adaptateur Universel', price: 45000, description: 'Voyage international', category: 'Électronique' },
            { name: 'Hub USB-C', price: 95000, description: 'Multi-ports' },
            { name: 'Câble HDMI 2m', price: 25000, description: 'Haute vitesse', category: 'Électronique' },
            { name: 'Tapis de souris', price: 25000, description: 'Standard' },
            { name: 'Lampe de bureau LED', price: 45000, description: 'Éclairage ajustable', category: 'Maison & Cuisine' }
        ]
    },
    {
        name: 'Ocean Trade',
        description: 'Électronique, Maison et Bricolage',
        category: 'Électronique',
        products: [
            { name: 'Samsung Galaxy A15', price: 950000, description: 'Smartphone performant' },
            { name: 'Télévision LG 32"', price: 1200000, description: 'HD Ready' },
            { name: 'Jeu de Tournevis', price: 45000, description: 'Bricolage précis', category: 'Jardin & Bricolage' },
            { name: 'Ventilateur sur pied', price: 180000, description: 'Rafraîchissement' },
            { name: 'Bouilloire électrique', price: 75000, description: 'Rapide', category: 'Maison & Cuisine' },
            { name: 'Fer à repasser', price: 125000, description: 'Vapeur', category: 'Maison & Cuisine' },
            { name: 'Marteau de charpentier', price: 35000, description: 'Outil robuste', category: 'Jardin & Bricolage' },
            { name: 'Mixeur plongeant', price: 95000, description: 'Cuisine pratique', category: 'Maison & Cuisine' },
            { name: 'Perceuse à percussion', price: 380000, description: 'Travaux lourds', category: 'Jardin & Bricolage' },
            { name: 'Machine à café', price: 480000, description: 'Espresso' },
            { name: 'Échelle télescopique', price: 550000, description: 'Accès hauteur', category: 'Jardin & Bricolage' }
        ]
    },
    {
        name: 'Librairie Mixte',
        description: 'Livres, Papeterie et Cadeaux',
        category: 'Livres',
        products: [
            { name: 'Roman Malgache', price: 25000, description: 'Littérature contemporaine' },
            { name: 'Cahier Oxford A4', price: 12000, description: 'Qualité supérieure' },
            { name: 'Boite de 12 Feutres', price: 18000, description: 'Couleurs vives', category: 'Jouets & Jeux' },
            { name: 'Dictionnaire Fr-Mg', price: 45000, description: 'Outil indispensable' },
            { name: 'BD Tintin au Tibet', price: 35000, description: 'Classique', category: 'Jouets & Jeux' },
            { name: 'Stylo plume élégant', price: 85000, description: 'Cadeau idéal' },
            { name: 'Globe terrestre LED', price: 120000, description: 'Décoration bureau', category: 'Maison & Cuisine' },
            { name: 'Jeu de cartes Madagascar', price: 15000, description: 'Ludique', category: 'Jouets & Jeux' }
        ]
    },
    {
        name: 'City Sport',
        description: 'Articles de sport et Performance',
        category: 'Sports & Loisirs',
        products: [
            { name: 'Ballon de Basket Spalding', price: 185000, description: 'Qualité pro' },
            { name: 'Tapis de Yoga Pro', price: 95000, description: 'Antidérapant', category: 'Beauté & Santé' },
            { name: 'Haltères 2x5kg', price: 120000, description: 'Musculation domicile' },
            { name: 'Maillot Barea', price: 85000, description: 'Fierté nationale', category: 'Vêtements' },
            { name: 'Gourde Isotherme 1L', price: 55000, description: 'Garde au frais 24h', category: 'Maison & Cuisine' },
            { name: 'Raquette de Tennis', price: 250000, description: 'Légère et puissante' },
            { name: 'Short de cyclisme', price: 65000, description: 'Confort rembourré', category: 'Vêtements' },
            { name: 'Magnésie en poudre', price: 15000, description: 'Adhérence maximale', category: 'Beauté & Santé' }
        ]
    }
];

const seedDataLogic = async () => {
    console.log('🧹 Clearing existing data (Categories, Shops, Products)...');
    await CategoryProduct.deleteMany({});
    await CategoryShop.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});

    // Get shop users created by seedUsersLogic
    const shopUsers = await User.find({ role: 'shop' });
    if (shopUsers.length === 0) {
        throw new Error('No shop users found. seedUsers must run first.');
    }
    console.log(`📋 Found ${shopUsers.length} shop users`);

    console.log('🌱 Seeding Categories...');
    const categoryShopMap = {};
    const categoryProductMap = {};

    for (const cat of categoriesList) {
        const newShopCat = await CategoryShop.create({
            name: cat.name,
            description: cat.description,
            icon: '🛍️'
        });
        categoryShopMap[cat.name] = newShopCat._id;

        const slug = cat.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const newProdCat = await CategoryProduct.create({
            name: cat.name,
            description: cat.description,
            slug
        });
        categoryProductMap[cat.name] = newProdCat._id;
    }
    console.log('✅ Categories created (Shop & Product).');

    const shopUserMap = {};
    shopUsers.forEach(user => {
        const key = user.profile.firstname.toLowerCase().replace(/\s+/g, '');
        shopUserMap[key] = user;
    });

    const summary = { shops: [], totalProducts: 0 };
    let shopIndex = 0;

    // Zones and floors variations
    const zones = ['A', 'B', 'C', 'D', 'E'];

    // Price history date ranges (Jan - Mar 2026), 5 periods
    const priceHistoryDates = [
        { from: new Date('2026-01-01'), to: new Date('2026-01-15') },
        { from: new Date('2026-01-16'), to: new Date('2026-01-31') },
        { from: new Date('2026-02-01'), to: new Date('2026-02-15') },
        { from: new Date('2026-02-16'), to: new Date('2026-02-28') },
        { from: new Date('2026-03-01'), to: new Date('2026-03-15') }
    ];

    for (const shopData of shopsList) {
        const shopKey = shopData.name.toLowerCase().replace(/\s+/g, '');
        const shopUser = shopUserMap[shopKey] || shopUsers[shopIndex % shopUsers.length];

        // Collect distinct product category IDs used by this shop's products
        const productCategoryIdSet = new Set();
        for (const prod of shopData.products) {
            const catName = prod.category || shopData.category;
            const catId = categoryProductMap[catName];
            if (catId) {
                productCategoryIdSet.add(catId);
            }
        }

        const productCategoryIds = Array.from(productCategoryIdSet);

        // Vary zone and floor for each shop
        const zone = zones[shopIndex % zones.length];
        const floor = Math.floor(shopIndex / zones.length) + 1;

        const shop = await Shop.create({
            name: shopData.name,
            description: shopData.description,
            category_id: categoryShopMap[shopData.category],
            product_category_ids: productCategoryIds,
            owner_user_id: shopUser._id,
            rent: { amount: 500000, currency: 'MGA' },
            location: { zone, floor },
            opening_hours: {
                monday: { open: '08:00', close: '17:00', is_closed: false },
                tuesday: { open: '08:00', close: '17:00', is_closed: false },
                wednesday: { open: '08:00', close: '17:00', is_closed: false },
                thursday: { open: '08:00', close: '17:00', is_closed: false },
                friday: { open: '08:00', close: '17:00', is_closed: false },
                saturday: { open: '08:00', close: '12:00', is_closed: false },
                sunday: { open: null, close: null, is_closed: true }
            }
        });
        console.log(`   🏠 Shop created: ${shop.name} (Zone ${zone}, Étage ${floor}) for user ${shopUser.profile.email}`);

        shopUser.shop_id = shop._id;
        await shopUser.save();
        shopIndex++;

        const productsToInsert = shopData.products.map((prod, prodIndex) => {
            const isFirstProduct = prodIndex === 0;

            // Build price_history: 5 entries
            const price_history = priceHistoryDates.map((period, periodIndex) => {
                // For the first product of each shop: last entry has a lower price (price drop)
                const isLastPeriod = periodIndex === priceHistoryDates.length - 1;
                const historyPrice = (isFirstProduct && isLastPeriod)
                    ? Math.round(prod.price * 0.8)  // 20% price drop
                    : prod.price;                     // constant price

                return {
                    price: historyPrice,
                    from: period.from,
                    to: period.to
                };
            });

            return {
                shop_id: shop._id,
                name: prod.name,
                description: prod.description,
                category_id: categoryProductMap[prod.category || shopData.category],
                price: {
                    current: isFirstProduct ? Math.round(prod.price * 0.8) : prod.price,
                    ttc: (isFirstProduct ? Math.round(prod.price * 0.8) : prod.price) * 1.2,
                    currency: 'MGA'
                },
                price_history,
                stock: { quantity: 100, status: 'in_stock' },
                is_active: true
            };
        });

        await Product.insertMany(productsToInsert);
        summary.shops.push({ shop: shop.name, products: productsToInsert.length });
        summary.totalProducts += productsToInsert.length;
        console.log(`      📦 ${productsToInsert.length} products added to ${shop.name}`);
    }

    return summary;
};

// ─── Controller ──────────────────────────────────────────────────────────────

/**
 * GET /api/seed/initiate
 * Unsecured route — seeds users then data in sequence.
 */
const initiate = async (req, res) => {
    try {
        console.log('\n🚀 Starting full database seed...');

        // Step 1: seed users
        const usersResult = await seedUsersLogic();
        console.log('✅ Users seeded successfully.');

        // Step 2: seed data (categories, shops, products)
        const dataResult = await seedDataLogic();
        console.log('✅ Data seeded successfully.');

        return res.status(200).json({
            success: true,
            message: '✨ Database initialized successfully!',
            data: {
                users: {
                    admin: usersResult.admin.profile.email,
                    shopUsers: usersResult.shopUsers.map(u => u.profile.email),
                    buyer: usersResult.buyer.profile.email
                },
                shops: dataResult.shops,
                totalProducts: dataResult.totalProducts
            }
        });
    } catch (error) {
        console.error('❌ Seed failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Seed failed',
            error: error.message
        });
    }
};

module.exports = { initiate };
