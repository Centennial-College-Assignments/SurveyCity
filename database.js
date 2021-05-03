/*
 * database.js
 * SurveyCity
 * 2020-11-09
 */

const debug = require("debug")("surveycity:db");
const mongoose = require("mongoose");

/**
 * Connects to the MongoDB server using Mongoose to the given URI.
 * @param {string} mongooseUri
 * @returns {Promise<void>} Resolves when connection to MongoDB is successful,
 *                          rejects if error is encountered before connection.
 */
module.exports.connect = mongooseUri => new Promise((resolve, reject) => {
  if (!mongooseUri) {
    debug("mongoose uri not found - using default localhost:27017")
    mongooseUri = "mongodb://localhost:27017/surveycity";
  }

  mongoose.connect(mongooseUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: process.env.NODE_ENV !== "production",
  });

  let errored = false;
  let opened = false;

  const conn = mongoose.connection;
  conn.on("error", err => {
    console.error("Connection error:", err);
    errored = true;

    if (!opened)
      reject(err);
  });

  conn.once("open", () => {
    debug("connected to MongoDB");
    opened = true;

    if (!errored)
      resolve();
  });
});

module.exports.connection = mongoose.connection;
