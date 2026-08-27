const mongoose = require("mongoose");
const dns = require("dns");

// Fallback DNS servers to fix querySrv ECONNREFUSED issues on Windows/ISP DNS
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
    // Ignore error if custom DNS setting is not permitted
}

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/teamflow";
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
