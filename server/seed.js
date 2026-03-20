import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Alert from './src/models/Alert.js';
import User from './src/models/User.js';
import SafeCircle from './src/models/SafeCircle.js';
import connectDB from './src/config/database.js';

dotenv.config();

const SEED_USERS = [
  { name: 'Admin Guardian', email: 'admin@guardian.com', password: 'Password123!', selectedArea: 'Downtown', preferences: ['crime', 'scam', 'hazard'] },
  { name: 'Sarah Community', email: 'sarah@example.com', password: 'Password123!', selectedArea: 'Riverside', preferences: ['weather', 'health', 'hazard'] },
  { name: 'Mike Safety', email: 'mike@example.com', password: 'Password123!', selectedArea: 'Oakwood', preferences: ['digital_threat', 'scam'] }
];

const SEED_ALERTS = [
  {
    title: 'Phishing SMS: "Post Office Package"',
    description: 'Received a text claiming I have an unpaid package shipping fee of $2.45. It includes a link to "post-office-parcel.com". Do not click, it is a credential harvester.',
    category: 'scam',
    subcategory: 'Smishing',
    severity: 'high',
    location: 'Riverside',
    status: 'active',
    aiSummary: 'A high-risk phishing SMS campaign is targeting Riverside residents using fake postal delivery fees to steal credentials.',
    actionableSteps: ['Do not click the link', 'Block the sender number', 'Report to 7726', 'Warn elderly neighbors'],
    source: 'community'
  },
  {
    title: 'Fallen Power Line on 5th Ave',
    description: 'A large tree branch has downed a power line near the intersection of 5th and Main. Sparking noted. Emergency services called.',
    category: 'hazard',
    subcategory: 'Electrical',
    severity: 'critical',
    location: 'Downtown',
    status: 'active',
    aiSummary: 'Critical electrical hazard in Downtown: sparking power lines reported at 5th and Main. Area is dangerous.',
    actionableSteps: ['Keep 30 feet away', 'Do not drive over lines', 'Alert nearby pedestrians', 'Expect power outages'],
    source: 'system',
    verified: true
  },
  {
    title: 'Suspicious Door-to-Door Solicitor',
    description: 'Man in a neon vest claiming to be from "Town Utilities" asking to see water heater serial numbers. No official ID shown. Driving a white unmarked van.',
    category: 'crime',
    subcategory: 'Suspicious Activity',
    severity: 'medium',
    location: 'Oakwood',
    status: 'active',
    aiSummary: 'Potential utility scam reported in Oakwood. Unauthorized solicitor asking for equipment access without ID.',
    actionableSteps: ['Ask for official ID', 'Do not allow entry', 'Call utility company to verify', 'Note vehicle license plate'],
    source: 'community'
  },
  {
    title: 'Localized Flash Flooding',
    description: 'Heavy rain has caused significant ponding at the Lakeview underpass. Several cars are stuck. Visibility is very low.',
    category: 'weather',
    subcategory: 'Flooding',
    severity: 'high',
    location: 'Lakeview',
    status: 'active',
    aiSummary: 'Severe flash flooding at Lakeview underpass. Multiple vehicles disabled. Avoid the area entirely.',
    actionableSteps: ['Turn around, don\'t drown', 'Seek higher ground', 'Turn on hazard lights', 'Monitor official emergency radio'],
    source: 'system',
    verified: true
  },
  {
    title: 'Air Quality: Heavy Smoke',
    description: 'Heavy smoke drift from controlled agricultural burning north of the city. Low visibility and respiratory irritants present.',
    category: 'health',
    subcategory: 'Air Quality',
    severity: 'medium',
    location: 'Greenfield',
    status: 'resolved',
    aiSummary: 'Medium health hazard in Greenfield: smoke drift from planned burns. Conditions are improving.',
    actionableSteps: ['Close windows', 'Set AC to recirculate', 'Limit outdoor activity', 'Check on neighbors with asthma'],
    source: 'system',
    verified: true
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('🗑️  Cleaning database...');
    await Promise.all([
      User.deleteMany({}),
      Alert.deleteMany({}),
      SafeCircle.deleteMany({})
    ]);

    console.log('👤 Seeding users...');
    const users = await User.create(SEED_USERS);
    const adminId = users[0]._id;

    console.log('⚠️ Seeding alerts...');
    const alertsWithSubmitter = SEED_ALERTS.map(a => ({
      ...a,
      submittedBy: adminId,
      verifiedBy: a.verified ? [users[1]._id, users[2]._id] : []
    }));
    await Alert.create(alertsWithSubmitter);

    console.log('⭕ Seeding Safe Circles...');
    await SafeCircle.create({
      name: 'Neighborhood Watch Beta',
      createdBy: adminId,
      members: [users[0]._id, users[1]._id, users[2]._id],
      messages: [
        { sender: adminId, content: '[encrypted]', encryptedContent: 'f7a8b9...', iv: '12345...', isEmergency: false }
      ]
    });

    console.log('\n✅ Database seeded successfully!');
    console.log(`- Created ${users.length} users`);
    console.log(`- Created ${SEED_ALERTS.length} alerts`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
