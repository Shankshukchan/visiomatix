const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  date: { type: Date, default: Date.now },
  comments: { type: Number, default: 0 },
});

module.exports = mongoose.model("Blog", BlogSchema);
