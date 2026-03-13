const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect } = require("../controllers/adminController");

// configure multer for uploads
// use memory storage so we can forward files to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getBlogs);
router.get("/:id", getBlog);
router.post("/", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
