const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createCareer,
  getCareers,
  getCareer,
  updateCareer,
  deleteCareer,
} = require("../controllers/careerController");
const { protect } = require("../controllers/adminController");

// use memory storage now that we push images to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getCareers);
router.get("/:id", getCareer);
router.post("/", protect, upload.single("image"), createCareer);
router.put("/:id", protect, upload.single("image"), updateCareer);
router.delete("/:id", protect, deleteCareer);

module.exports = router;
