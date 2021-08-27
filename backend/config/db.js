"use strict";
const mongoose = require("mongoose");
const keys = require("../config/keys");

const connectDB = async () => {
  try {
    const databaseName = "tutor";
    const con = await mongoose.connect(keys.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log(`Database connected : ${con.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
