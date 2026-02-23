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
    const shopNames = ['adidas', 'flowup', 'jumboscore', 'nike', 'samsung'];
    const shopUsers = [];

    for (const shopName of shopNames) {
        const shopUser = await User.create({
            role: 'shop',
            profile: {
                firstname: shopName.charAt(0).toUpperCase() + shopName.slice(1),
                lastname: 'Manager',
                email: `${shopName}@gmail.com`,
                password_hash: `${shopName}123`,
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
        name: 'Adidas',
        description: 'Vêtements et chaussures de sport',
        category: 'Vêtements',
        products: [
            { name: 'T-shirt Adidas Originals', price: 120000, description: 'T-shirt en coton confortable' },
            { name: 'Stan Smith', price: 400000, description: 'Chaussures iconiques' },
            { name: 'Ultraboost', price: 600000, description: 'Chaussures de running performantes' },
            { name: 'Pantalon de survêtement', price: 200000, description: 'Confortable pour le sport' },
            { name: 'Veste à capuche', price: 300000, description: 'Veste chaude et stylée' },
            { name: 'Chaussettes (Lot de 3)', price: 50000, description: 'Chaussettes de sport' },
            { name: 'Sac à dos', price: 150000, description: 'Sac pratique pour le sport' },
            { name: 'Casquette', price: 80000, description: 'Casquette ajustable' },
            { name: 'Short de sport', price: 100000, description: 'Short léger et respirant' },
            { name: 'Ballon de football', price: 120000, description: 'Ballon officiel' }
        ]
    },
    {
        name: 'Flow Up',
        description: 'Spécialiste PC Gamer et High-Tech',
        category: 'Informatique',
        products: [
            { name: 'PC Gamer RTX 4060', price: 5000000, description: 'PC puissant pour le gaming' },
            { name: 'Écran 144Hz', price: 1200000, description: 'Moniteur fluide pour jeux' },
            { name: 'Clavier Mécanique', price: 400000, description: 'Clavier RGB switches rouges' },
            { name: 'Souris Gaming', price: 200000, description: 'Souris précise 16000 DPI' },
            { name: 'Casque Gaming', price: 300000, description: 'Casque avec micro et son surround' },
            { name: 'Tapis de souris XXL', price: 80000, description: 'Grand tapis pour clavier et souris' },
            { name: 'Webcam HD', price: 150000, description: 'Pour le streaming' },
            { name: 'Microphone USB', price: 250000, description: 'Micro de qualité studio' },
            { name: 'Chaise Gaming', price: 800000, description: 'Chaise ergonomique confortable' },
            { name: 'Disque SSD 1TB', price: 350000, description: 'Stockage rapide' }
        ]
    },
    {
        name: 'Jumbo Score',
        description: 'Supermarché et alimentation',
        category: 'Alimentation',
        products: [
            { name: 'Riz Blanc (5kg)', price: 25000, description: 'Riz de qualité supérieure' },
            { name: 'Huile de tournesol (1L)', price: 12000, description: 'Huile pour cuisson' },
            { name: 'Pâtes (500g)', price: 4000, description: 'Pâtes italiennes' },
            { name: 'Sucre (1kg)', price: 5000, description: 'Sucre blanc raffiné' },
            { name: 'Lait (1L)', price: 6000, description: 'Lait demi-écrémé' },
            { name: 'Café moulu', price: 15000, description: 'Café arabica' },
            { name: 'Biscuits', price: 3000, description: 'Biscuits au chocolat' },
            { name: "Jus d'orange (1L)", price: 8000, description: '100% pur jus' },
            { name: 'Savon', price: 2000, description: 'Savon de toilette' },
            { name: 'Dentifrice', price: 5000, description: 'Protection caries' }
        ]
    },
    {
        name: 'Nike',
        description: 'Just Do It - Sportswear',
        category: 'Sports & Loisirs',
        products: [
            { name: 'Air Jordan 1', price: 700000, description: 'Basket légendaire' },
            { name: 'Air Max 90', price: 600000, description: 'Style et confort' },
            { name: 'T-shirt Dri-Fit', price: 150000, description: 'Évacue la transpiration' },
            { name: 'Short Running', price: 120000, description: 'Idéal pour la course' },
            { name: 'Legging', price: 180000, description: 'Pour le yoga et le fitness' },
            { name: 'Sac de sport', price: 200000, description: 'Grand volume' },
            { name: 'Bandeau', price: 40000, description: 'Accessoire de sport' },
            { name: 'Gourde', price: 50000, description: 'Sans BPA' },
            { name: 'Chaussures de foot', price: 450000, description: 'Crampons pour terrain sec' },
            { name: 'Sweatshirt', price: 350000, description: 'Pull confortable' }
        ]
    },
    {
        name: 'Samsung Store',
        description: "Leader de l'électronique",
        category: 'Électronique',
        products: [
            { name: 'Samsung Galaxy S24', price: 4000000, description: 'Dernier smartphone Samsung' },
            { name: 'Galaxy Watch 6', price: 1500000, description: 'Montre connectée' },
            { name: 'Galaxy Buds 2', price: 600000, description: 'Écouteurs sans fil' },
            { name: 'TV QLED 55"', price: 3000000, description: 'Télévision 4K' },
            { name: 'Tablette Galaxy Tab S9', price: 3500000, description: 'Tablette puissante' },
            { name: 'Chargeur Rapide', price: 100000, description: 'Chargeur 45W' },
            { name: 'Coque de protection', price: 80000, description: 'Pour Galaxy S24' },
            { name: 'Carte MicroSD 256GB', price: 150000, description: 'Extension de mémoire' },
            { name: 'Moniteur PC', price: 800000, description: 'Écran bureautique' },
            { name: 'Barre de son', price: 1000000, description: 'Son cinéma' }
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

    for (const shopData of shopsList) {
        const shopKey = shopData.name.toLowerCase().replace(/\s+/g, '');
        const shopUser = shopUserMap[shopKey] || shopUsers[shopIndex % shopUsers.length];

        const shop = await Shop.create({
            name: shopData.name,
            description: shopData.description,
            category_id: categoryShopMap[shopData.category],
            owner_user_id: shopUser._id,
            rent: { amount: 500, currency: 'MGA' },
            location: { zone: 'A', floor: 1 }
        });
        console.log(`   🏠 Shop created: ${shop.name} for user ${shopUser.profile.email}`);

        shopUser.shop_id = shop._id;
        await shopUser.save();
        shopIndex++;

        const productsToInsert = shopData.products.map(prod => ({
            shop_id: shop._id,
            name: prod.name,
            description: prod.description,
            category_id: categoryProductMap[shopData.category],
            price: {
                current: prod.price,
                ttc: prod.price * 1.2,
                currency: 'MGA'
            },
            stock: { quantity: 100, status: 'in_stock' },
            is_active: true
        }));

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
