const cloudinary = require("cloudinary").v2;

// configure using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "", // set in .env
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

module.exports = cloudinary;
