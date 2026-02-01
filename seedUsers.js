const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Shop = require('./src/models/Shop');
const Product = require('./src/models/Product');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grosserie');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Shop.deleteMany({});
        await Product.deleteMany({});

        console.log('🌱 Seeding Users...');
        
        // 1. Create Admin
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

        // 2. Create Shop Owner
        const shopOwner = await User.create({
            role: 'shop',
            profile: {
                firstname: 'Shop',
                lastname: 'Manager',
                email: 'manager@grosserie.com',
                password_hash: 'manager123',
                phone: '0987654321'
            }
        });
        console.log(`👤 Shop Manager created: ${shopOwner.profile.email}`);

        // 3. Create Buyer
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

        console.log('🌱 Seeding Shop...');
        
        // 4. Create Shop
        const shop = await Shop.create({
            name: 'Fresh Market',
            description: 'Best local fresh produce',
            category: 'Grocery',
            owner_user_id: shopOwner._id,
            location: {
                floor: 1,
                zone: 'A',
                map_position: { x: 10, y: 20 }
            },
            rent: {
                amount: 1500,
                currency: 'EUR',
                billing_cycle: 'monthly'
            },
            opening_hours: {
                monday: { open: '08:00', close: '20:00' },
                tuesday: { open: '08:00', close: '20:00' },
                wednesday: { open: '08:00', close: '20:00' },
                thursday: { open: '08:00', close: '20:00' },
                friday: { open: '08:00', close: '21:00' },
                saturday: { open: '09:00', close: '21:00' },
                sunday: { open: '09:00', close: '13:00' }
            }
        });
        console.log(`🏪 Shop created: ${shop.name}`);

        // Update Shop Owner with shop_id
        shopOwner.shop_id = shop._id;
        await shopOwner.save();

        console.log('🌱 Seeding Products...');

        // 5. Create Products
        const products = await Product.insertMany([
            {
                shop_id: shop._id,
                name: 'Organic Apples',
                description: 'Fresh organic apples from local farmers',
                category: 'Fruits',
                price: {
                    current: 2.50,
                    currency: 'EUR'
                },
                stock: {
                    quantity: 100,
                    threshold: 10,
                    status: 'in_stock'
                },
                images: ['apple.jpg']
            },
            {
                shop_id: shop._id,
                name: 'Whole Wheat Bread',
                description: 'Freshly baked whole wheat bread',
                category: 'Bakery',
                price: {
                    current: 1.80,
                    currency: 'EUR'
                },
                stock: {
                    quantity: 50,
                    threshold: 5,
                    status: 'in_stock'
                },
                images: ['bread.jpg']
            },
            {
                shop_id: shop._id,
                name: 'Orange Juice',
                description: 'Freshly squeezed orange juice 1L',
                category: 'Beverages',
                price: {
                    current: 3.20,
                    currency: 'EUR'
                },
                stock: {
                    quantity: 20,
                    threshold: 5,
                    status: 'low_stock'
                },
                images: ['juice.jpg']
            }
        ]);
        console.log(`🍎 Created ${products.length} products`);

        console.log('\n✨ Seeding Complete!');
        console.log('------------------------------------------------');
        console.log('Credentials:');
        console.log('ADMIN: admin@grosserie.com / admin123');
        console.log('SHOP:  manager@grosserie.com / manager123');
        console.log('BUYER: buyer@grosserie.com / buyer123');
        console.log('------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
