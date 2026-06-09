const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

// 1. Manually parse .env.local
const dotenvPath = path.join(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(dotenvPath)) {
  const content = fs.readFileSync(dotenvPath, 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = env.APPWRITE_API_KEY;
const databaseId = env.APPWRITE_DATABASE_ID;
const usersCollectionId = env.APPWRITE_USERS_COLLECTION_ID || 'users';
const productsCollectionId = env.APPWRITE_PRODUCTS_COLLECTION_ID || 'products';
const ordersCollectionId = env.APPWRITE_ORDERS_COLLECTION_ID || 'orders';

if (!projectId || !apiKey || !databaseId) {
  console.error('Error: Please define NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_DATABASE_ID in .env.local');
  process.exit(1);
}

// 2. Initialize Appwrite Client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

// Helper function to sleep (Appwrite attributes are created asynchronously)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createCollectionIfNotExist(collectionId, name) {
  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection "${name}" (${collectionId}) already exists.`);
  } catch (error) {
    if (error.code === 404) {
      console.log(`Creating collection "${name}" (${collectionId})...`);
      await databases.createCollection(databaseId, collectionId, name);
      console.log(`Collection "${name}" created.`);
      await sleep(2000); // Wait for metadata lock to release
    } else {
      throw error;
    }
  }
}

async function createAttributeIfNotExist(collectionId, attributeName, createFn, ...args) {
  try {
    await databases.getAttribute(databaseId, collectionId, attributeName);
    console.log(`Attribute "${attributeName}" already exists on collection "${collectionId}".`);
  } catch (error) {
    if (error.code === 404) {
      console.log(`Creating attribute "${attributeName}" on collection "${collectionId}"...`);
      await createFn(databaseId, collectionId, attributeName, ...args);
      await sleep(2000); // Appwrite locks collections for schema changes, wait to prevent collision
    } else {
      throw error;
    }
  }
}

async function setup() {
  try {
    console.log('Connecting to Appwrite databases API...');

    // Users Collection Setup
    await createCollectionIfNotExist(usersCollectionId, 'Users');
    await createAttributeIfNotExist(usersCollectionId, 'phone', databases.createStringAttribute.bind(databases), 20, false);
    await createAttributeIfNotExist(usersCollectionId, 'email', databases.createStringAttribute.bind(databases), 150, false);
    await createAttributeIfNotExist(usersCollectionId, 'role', databases.createStringAttribute.bind(databases), 20, false, 'member');
    await createAttributeIfNotExist(usersCollectionId, 'name', databases.createStringAttribute.bind(databases), 100, false);
    await createAttributeIfNotExist(usersCollectionId, 'createdAt', databases.createStringAttribute.bind(databases), 50, false);

    // Products Collection Setup
    await createCollectionIfNotExist(productsCollectionId, 'Products');
    await createAttributeIfNotExist(productsCollectionId, 'name', databases.createStringAttribute.bind(databases), 200, true);
    await createAttributeIfNotExist(productsCollectionId, 'category', databases.createStringAttribute.bind(databases), 100, true);
    await createAttributeIfNotExist(productsCollectionId, 'price', databases.createFloatAttribute.bind(databases), true);
    await createAttributeIfNotExist(productsCollectionId, 'stock', databases.createIntegerAttribute.bind(databases), false, 0, 1000000, 0);
    await createAttributeIfNotExist(productsCollectionId, 'imageUrl', databases.createStringAttribute.bind(databases), 500, true);
    await createAttributeIfNotExist(productsCollectionId, 'otherImageUrls', databases.createStringAttribute.bind(databases), 5000, false);
    await createAttributeIfNotExist(productsCollectionId, 'originalPrice', databases.createFloatAttribute.bind(databases), false);
    await createAttributeIfNotExist(productsCollectionId, 'sizes', databases.createStringAttribute.bind(databases), 1000, false);

    // Orders Collection Setup
    await createCollectionIfNotExist(ordersCollectionId, 'Orders');
    await createAttributeIfNotExist(ordersCollectionId, 'userPhone', databases.createStringAttribute.bind(databases), 20, false);
    await createAttributeIfNotExist(ordersCollectionId, 'userEmail', databases.createStringAttribute.bind(databases), 150, false);
    await createAttributeIfNotExist(ordersCollectionId, 'items', databases.createStringAttribute.bind(databases), 20000, true); // Stored as serialized JSON
    await createAttributeIfNotExist(ordersCollectionId, 'totalAmount', databases.createFloatAttribute.bind(databases), true);
    await createAttributeIfNotExist(ordersCollectionId, 'shippingAddress', databases.createStringAttribute.bind(databases), 5000, true); // Stored as serialized JSON
    await createAttributeIfNotExist(ordersCollectionId, 'status', databases.createStringAttribute.bind(databases), 50, false, 'Processing');

    console.log('\nAppwrite database initialized successfully!');
  } catch (err) {
    console.error('\nDatabase setup failed:', err.message || err);
    process.exit(1);
  }
}

setup();
