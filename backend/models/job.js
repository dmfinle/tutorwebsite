const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema(
  {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    owner: {
      type: String,
    },
    read: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("job", JobSchema);
