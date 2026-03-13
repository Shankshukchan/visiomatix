const { Resend } = require("resend");
const Subscriber = require("../models/Subscriber");

const resend = new Resend(process.env.RESEND_API_KEY);

// Email validation regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send email to all subscribers
const sendEmailToSubscribers = async (subject, htmlContent, textContent) => {
  try {
    // Fetch all active subscribers
    const subscribers = await Subscriber.find({ isActive: true });

    if (subscribers.length === 0) {
      console.log("No active subscribers found");
      return { success: true, sent: 0, failed: 0 };
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send emails one by one
    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: process.env.CONTACT_EMAIL,
          to: subscriber.email,
          subject: subject,
          html: htmlContent,
          text: textContent,
        });
        sentCount++;
        console.log(`Email sent to ${subscriber.email}`);
      } catch (error) {
        failedCount++;
        console.error(`Failed to send email to ${subscriber.email}:`, error);
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Email campaign finished: ${sentCount} sent, ${failedCount} failed`,
    );
    return { success: true, sent: sentCount, failed: failedCount };
  } catch (error) {
    console.error("Error sending emails to subscribers:", error);
    return { success: false, sent: 0, failed: 0, error: error.message };
  }
};

// Generate blog notification email
const generateBlogEmailContent = (blog) => {
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">New Blog Post from Visiomatix Media</h2>
          <p>We have published a new blog post that you might find interesting!</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2980b9;">${blog.title}</h3>
            ${
              blog.imageUrl
                ? `<img src="${blog.imageUrl}" alt="${blog.title}" style="max-width: 100%; height: auto; border-radius: 5px; margin: 10px 0;">`
                : ""
            }
            <p><strong>Published:</strong> ${new Date(blog.date).toLocaleDateString()}</p>
            <p>${blog.description.substring(0, 200)}...</p>
          </div>

          <p style="margin-top: 20px;">
            <a href="${process.env.WEBSITE_URL}/blog" style="background-color: #2980b9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Read More</a>
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to Visiomatix Media updates.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `New Blog Post from Visiomatix Media

${blog.title}

Published: ${new Date(blog.date).toLocaleDateString()}

${blog.description}

Read more at: ${process.env.WEBSITE_URL}/blog

You received this email because you subscribed to Visiomatix Media updates.`;

  return { htmlContent, textContent };
};

// Generate career notification email
const generateCareerEmailContent = (career) => {
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">New Career Opportunity at Visiomatix Media</h2>
          <p>We have a new exciting career opportunity for you!</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #27ae60;">${career.title}</h3>
            ${
              career.imageUrl
                ? `<img src="${career.imageUrl}" alt="${career.title}" style="max-width: 100%; height: auto; border-radius: 5px; margin: 10px 0;">`
                : ""
            }
            <p><strong>Location:</strong> ${career.location || "Not specified"}</p>
            <p><strong>Posted:</strong> ${new Date(career.date).toLocaleDateString()}</p>
            <p>${career.description.substring(0, 200)}...</p>
            ${
              career.requirements
                ? `<p><strong>Requirements:</strong> ${career.requirements.substring(0, 150)}...</p>`
                : ""
            }
          </div>

          <p style="margin-top: 20px;">
            <a href="${process.env.WEBSITE_URL}/careers" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Job Details</a>
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to Visiomatix Media updates.
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `New Career Opportunity at Visiomatix Media

${career.title}

Location: ${career.location || "Not specified"}
Posted: ${new Date(career.date).toLocaleDateString()}

${career.description}

Requirements: ${career.requirements || "N/A"}

View more at: ${process.env.WEBSITE_URL}/careers

You received this email because you subscribed to Visiomatix Media updates.`;

  return { htmlContent, textContent };
};

module.exports = {
  validateEmail,
  sendEmailToSubscribers,
  generateBlogEmailContent,
  generateCareerEmailContent,
};
