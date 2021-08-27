const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  secretOrKey: process.env.SECRET_OR_KEY,
  saltRounds: process.env.SALT_ROUNDS,
};
