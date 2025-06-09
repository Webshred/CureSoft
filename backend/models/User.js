import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String, // hashed
  phone: String,
  address: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});


export default mongoose.model('User', userSchema);
