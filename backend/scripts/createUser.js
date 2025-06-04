// scripts/createUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const createUser = async (email, password, role = 'user') => {
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, role });
  await user.save();
  console.log(`User created: ${email} (${role})`);
};

await createUser('admin@example.com', 'admin123', 'admin');
await createUser('user@example.com', 'user123', 'user');
process.exit();