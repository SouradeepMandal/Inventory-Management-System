const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Ensure reliable DNS SRV resolution across environments
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Ignore error if custom DNS cannot be set
}

const uri = process.env.MONGO_URL || "mongodb+srv://souradeepmandal459_db_user:AkgRUlMsMbc4zmvm@cluster0.tcottl5.mongodb.net/InventoryManagementApp?retryWrites=true&w=majority";

function main() {
    mongoose.connect(uri).then(() => {
        console.log("Successfully connected to MongoDB");
    }).catch((err) => {
        console.log("MongoDB Connection Error: ", err);
    });
}

module.exports = { main };