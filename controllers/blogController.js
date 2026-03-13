const Blog = require("../models/Blog");
const cloudinary = require("../utils/cloudinary");
const {
  sendEmailToSubscribers,
  generateBlogEmailContent,
} = require("../utils/emailService");

// helper to upload file buffer to Cloudinary
async function uploadToCloudinary(file) {
  if (!file) return null;
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "visiomatix",
  });
  return result.secure_url;
}

exports.createBlog = async (req, res) => {
  try {
    const { title, description, date, comments } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }
    const blog = new Blog({ title, description, date, imageUrl, comments });
    await blog.save();

    // Send email notifications to all subscribers
    try {
      const { htmlContent, textContent } = generateBlogEmailContent(blog);
      const emailResult = await sendEmailToSubscribers(
        `New Blog Post: ${title}`,
        htmlContent,
        textContent,
      );
      console.log("Blog notification emails sent:", emailResult);
    } catch (emailError) {
      console.error("Error sending blog notification emails:", emailError);
      // Don't fail the blog creation if email sending fails
    }

    res.status(201).json({
      message: "Blog created and notification emails sent to subscribers",
      blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update and delete handlers for admin operations
exports.updateBlog = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.imageUrl = await uploadToCloudinary(req.file);
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!blog) return res.status(404).json({ message: "Not found" });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
