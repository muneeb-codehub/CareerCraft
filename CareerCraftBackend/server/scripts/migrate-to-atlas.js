import mongoose from 'mongoose';

// Local and Atlas URIs
const LOCAL_URI = 'mongodb://localhost:27017/careercraft_db';
const ATLAS_URI = 'mongodb+srv://muneebarif226_db_user:6bhnAGUXLG7q4Dr5@cluster0.wwghhnw.mongodb.net/careercraft';

// Collection names to migrate
const collections = [
  'users',
  'careerroadmaps',
  'interviewsimulators',
  'portfolios',
  'resumes',
  'skillgaps',
  'weeklytrackers'
];

async function migrateData() {
  try {
    console.log('🔄 Starting migration from local to Atlas...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB\n');

    // Connect to Atlas
    console.log('📡 Connecting to Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to Atlas\n');

    // Migrate each collection
    for (const collectionName of collections) {
      try {
        console.log(`📦 Migrating collection: ${collectionName}`);
        
        // Get data from local
        const localCollection = localConn.collection(collectionName);
        const documents = await localCollection.find({}).toArray();
        
        if (documents.length === 0) {
          console.log(`   ⚠️  No documents found in ${collectionName}`);
          continue;
        }

        console.log(`   📊 Found ${documents.length} documents`);

        // Insert into Atlas
        const atlasCollection = atlasConn.collection(collectionName);
        
        // Clear existing data in Atlas (optional - remove if you want to keep existing data)
        await atlasCollection.deleteMany({});
        
        // Insert all documents
        await atlasCollection.insertMany(documents);
        
        console.log(`   ✅ Successfully migrated ${documents.length} documents\n`);
      } catch (error) {
        console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
      }
    }

    // Close connections
    await localConn.close();
    await atlasConn.close();

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
