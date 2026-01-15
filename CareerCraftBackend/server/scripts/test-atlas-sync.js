// Test MongoDB Atlas sync between API and Compass
import fetch from 'node-fetch';

const testUser = {
    name: "Atlas Sync Test User",
    email: `atlastest${Date.now()}@careercraft.com`,
    password: "TestPass123"
};

console.log('🧪 Testing MongoDB Atlas Connection...\n');
console.log('📝 Creating user via API:', testUser.email);

try {
    const response = await fetch('http://localhost:5000/api/auth2/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    
    if (result.success) {
        console.log('\n✅ SUCCESS! User created via API');
        console.log('\n📊 User Details:');
        console.log('   Name:', result.data.user.name);
        console.log('   Email:', result.data.user.email);
        console.log('   ID:', result.data.user._id);
        
        console.log('\n🔍 NOW CHECK MONGODB COMPASS:');
        console.log('   1. Open MongoDB Compass');
        console.log('   2. Connect to: mongodb+srv://muneebarif226_db_user:6bhnAGUXLG7q4Dr5@cluster0.wwghhnw.mongodb.net/');
        console.log('   3. Database: careercraft');
        console.log('   4. Collection: users');
        console.log('   5. Search for email:', testUser.email);
        console.log('\n✨ You should see this user in Compass immediately!');
    } else {
        console.log('❌ Failed:', result.message);
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}
