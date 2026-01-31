/**
 * Seed Script for Grosserie Project
 * Usage: node seedUsers.js
 */

// Axios removed to use native fetch

const API_URL = 'http://localhost:5000/api/auth/register';

const usersToSeed = [
    {
        name: 'Super Admin',
        email: 'admin@grosserie.com',
        password: 'adminpassword123',
        role: 'ADMIN',
        phone: '1234567890'
    },
    {
        name: 'Shop Manager',
        email: 'manager@grosserie.com',
        password: 'managerpassword123',
        role: 'MANAGER',
        phone: '0987654321'
    },
    {
        name: 'John Doe (Buyer)',
        email: 'buyer@grosserie.com',
        password: 'buyerpassword123',
        role: 'BUYER',
        phone: '1122334455'
    }
];

async function seedUsers() {
    console.log('🌱 Starting User Seeding...');

    for (const user of usersToSeed) {
        try {
            console.log(`Creating user: ${user.email} (${user.role})...`);
            const response = await axios.post(API_URL, user);
            console.log(`✅ Success! Created ${user.role} with ID: ${response.data._id}`);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message === 'User already exists') {
                console.log(`⚠️ User ${user.email} already exists. Skipping.`);
            } else {
                console.error(`❌ Failed to create ${user.email}:`, error.message);
            }
        }
    }

    console.log('\n✨ Seeding Complete!');
    console.log('------------------------------------------------');
    console.log('credentials:');
    console.log('ADMIN:   admin@grosserie.com / adminpassword123');
    console.log('MANAGER: manager@grosserie.com / managerpassword123');
    console.log('BUYER:   buyer@grosserie.com / buyerpassword123');
    console.log('------------------------------------------------');
}

// First, we need to install axios if it's not available in the context where we run this.
// But assuming standard node environment or I can run it via `npx` or just use fetch if Node 18+
// To be safe and since I can control execution, I'll use fetch which is native in recent Node versions.

(async () => {
    // Re-defining using fetch to avoid dependency on axios
    const register = async (userData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();

            if (response.ok) {
                console.log(`✅ Success! Created ${userData.role} with ID: ${data._id}`);
            } else if (data.message === 'User already exists') {
                console.log(`⚠️ User ${userData.email} already exists. Skipping.`);
            } else {
                console.error(`❌ Failed to create ${userData.email}:`, data.message);
            }
        } catch (error) {
            console.error(`❌ Error connecting to server for ${userData.email}:`, error.message);
        }
    };

    console.log('🌱 Starting User Seeding (using native fetch)...');
    for (const user of usersToSeed) {
        await register(user);
    }

    console.log('\n✨ Seeding Complete!');
    console.log('------------------------------------------------');
    console.log('credentials:');
    console.log('ADMIN:   admin@grosserie.com / adminpassword123');
    console.log('MANAGER: manager@grosserie.com / managerpassword123');
    console.log('BUYER:   buyer@grosserie.com / buyerpassword123');
    console.log('------------------------------------------------');

})();
