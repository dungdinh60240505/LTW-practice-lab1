const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config();

// Ensure SRV records can be resolved properly on all networks (e.g. Windows / ISP DNS)
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // ignore if not supported
}

/**
 * Connect to the MongoDB database given by the DB_URL environment variable.
 */
async function dbConnect() {
  const url = process.env.DB_URL || "mongodb://127.0.0.1:27017/photo-sharing";
  try {
    await mongoose.connect(url);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Unable to connect to MongoDB!");
    console.error(error);
    throw error;
  }
}

module.exports = dbConnect;

