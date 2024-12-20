const mongoose = require('mongoose');
const { MONGODB_URI, MONGODB_NAME } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI + MONGODB_NAME);
        console.log('MongoDB connected...');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
