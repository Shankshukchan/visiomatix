const Career = require("../models/Career");
const cloudinary = require("../utils/cloudinary");
const {
  sendEmailToSubscribers,
  generateCareerEmailContent,
} = require("../utils/emailService");

// helper to upload buffer to Cloudinary
async function uploadToCloudinary(file) {
  if (!file) return null;
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "visiomatix",
  });
  return result.secure_url;
}

exports.createCareer = async (req, res) => {
  try {
    const { title, description, date, requirements, location } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }
    const career = new Career({
      title,
      description,
      date,
      requirements,
      location,
      imageUrl,
    });
    await career.save();

    // Send email notifications to all subscribers
    try {
      const { htmlContent, textContent } = generateCareerEmailContent(career);
      const emailResult = await sendEmailToSubscribers(
        `New Career Opportunity: ${title}`,
        htmlContent,
        textContent,
      );
      console.log("Career notification emails sent:", emailResult);
    } catch (emailError) {
      console.error("Error sending career notification emails:", emailError);
      // Don't fail the career creation if email sending fails
    }

    res.status(201).json({
      message: "Career posted and notification emails sent to subscribers",
      career,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({ date: -1 });
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ message: "Not found" });
    res.json(career);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCareer = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.imageUrl = await uploadToCloudinary(req.file);
    }
    const career = await Career.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!career) return res.status(404).json({ message: "Not found" });
    res.json(career);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
