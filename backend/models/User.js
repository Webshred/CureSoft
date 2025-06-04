import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: String,
  password: String, // hashed
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});


export default mongoose.model('User', userSchema);
