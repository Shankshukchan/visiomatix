const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  requirements: { type: String },
  location: { type: String },
  imageUrl: { type: String },
});

module.exports = mongoose.model("Career", CareerSchema);
