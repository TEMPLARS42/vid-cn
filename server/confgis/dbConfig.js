const mongoose = require('mongoose');
const { MONGODB_URI, MONGODB_NAME, MONGODB_SOURCE } = process.env;

const connectDB = async () => {
    try {
        const connectionString = MONGODB_SOURCE == "ATLAS" ? MONGODB_URI : MONGODB_URI + MONGODB_NAME;
        await mongoose.connect(connectionString);
        console.log('MongoDB connected...');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
