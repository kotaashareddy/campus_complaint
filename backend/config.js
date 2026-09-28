const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Fix Windows Node.js querySrv ECONNREFUSED DNS resolution error
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.log("DNS setServers failed:", e.message);
}

let MONGO_URI = process.env.MONGO_URI || "mongodb+srv://23pa1a4584:hari18@cluster0.1ouaqqm.mongodb.net/complaintSystem?retryWrites=true&w=majority&appName=Cluster0";

// Ensure retryWrites and DB name are included if missing
if (!MONGO_URI.includes("?")) {
  MONGO_URI = `${MONGO_URI}/complaintSystem?retryWrites=true&w=majority`;
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));


