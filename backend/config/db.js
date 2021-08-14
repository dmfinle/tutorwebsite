"use strict";
import mongoose from "mongoose";
import User from "../models/usersModel.js";

const connectDB = async () => {
  try {
    const databaseName = "tutor";
    const con = await mongoose.connect(
      `mongodb://127.0.0.1:27017/${databaseName}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );

    console.log(`Database connected : ${con.connection.host}`);
  } catch (error) {
    console.log(error(`Error: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
