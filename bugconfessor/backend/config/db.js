const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const c = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB Atlas:', c.connection.host);
  } catch (err) {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
