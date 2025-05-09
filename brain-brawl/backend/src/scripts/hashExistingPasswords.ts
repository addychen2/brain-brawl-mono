import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User';

// Load environment variables
dotenv.config();

const SALT_ROUNDS = 10;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brain-brawl';

async function hashExistingPasswords() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database`);

    let updatedCount = 0;
    
    // Process each user
    for (const user of users) {
      // Check if password is already hashed (has a $ in it, indicating bcrypt format)
      if (!user.password.includes('$')) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        // Update user with hashed password
        await User.updateOne({ _id: user._id }, { password: hashedPassword });
        
        updatedCount++;
        console.log(`Updated password for user: ${user.username}`);
      } else {
        console.log(`Password for user ${user.username} is already hashed`);
      }
    }
    
    console.log(`Completed! Updated ${updatedCount} out of ${users.length} users`);
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

// Execute the function
hashExistingPasswords();