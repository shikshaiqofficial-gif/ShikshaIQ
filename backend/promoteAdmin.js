require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');

const targetEmail = process.argv[2] || 'rahul@shikshaiq.com';

async function promote() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User not found with email: ${targetEmail}`);
    } else {
      console.log(`✅ Success! User "${user.name}" (${user.email}) is now an [${user.role.toUpperCase()}].`);
    }
  } catch (err) {
    console.error('❌ Error updating user:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

promote();