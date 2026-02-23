const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

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

const seedUsers = async () => {
    try {
        await connectDB();

        console.log('🧹 Clearing existing users...');
        await User.deleteMany({});

        console.log('🌱 Creating users...');
        
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

        // 2. Create Shop Users (individual users for each shop)
        const shopNames = ['adidas', 'flowup', 'jumboscore', 'nike', 'samsung'];
        const shopUsers = [];
        
        for (let i = 0; i < shopNames.length; i++) {
            const shopName = shopNames[i];
            const email = `${shopName}@gmail.com`;
            const password = `${shopName}123`;
            
            const shopUser = await User.create({
                role: 'shop',
                profile: {
                    firstname: shopName.charAt(0).toUpperCase() + shopName.slice(1),
                    lastname: 'Manager',
                    email: email,
                    password_hash: password,
                    phone: `034${Math.floor(1000000 + Math.random() * 9000000)}`
                }
            });
            shopUsers.push(shopUser);
            console.log(`👤 Shop User created: ${shopUser.profile.email}`);
        }

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

        console.log('\n✨ Users seeding complete!');
        console.log('------------------------------------------------');
        console.log('Credentials:');
        console.log('ADMIN: admin@grosserie.com / admin123');
        console.log('SHOP USERS:');
        shopNames.forEach(name => {
            console.log(`  ${name}: ${name}@gmail.com / ${name}123`);
        });
        console.log('BUYER: buyer@grosserie.com / buyer123');
        console.log('------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Users seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();