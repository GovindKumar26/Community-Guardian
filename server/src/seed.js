import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import Alert from './models/Alert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seed = async () => {
  try {
    await connectDB();

    // Load mock data
    const dataPath = join(__dirname, '../../data/mock-incidents.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    const { incidents } = JSON.parse(rawData);

    // Clear existing system alerts (preserve user-submitted ones)
    await Alert.deleteMany({ source: 'system' });
    console.log('✓ Cleared existing system alerts');

    // Insert mock incidents
    const created = await Alert.insertMany(
      incidents.map(inc => ({ ...inc, status: 'active' }))
    );

    console.log(`✓ Seeded ${created.length} mock incidents`);
    console.log('\nCategory breakdown:');
    const categories = incidents.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
