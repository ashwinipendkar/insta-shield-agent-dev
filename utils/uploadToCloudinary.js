const cloudinary = require('cloudinary').v2;

// Cloudinary config (set your credentials)
cloudinary.config({
  cloud_name: 'dcjnwh1ll',
  api_key: '557813482223151',
  api_secret: 'yOpWJBFDcUj439F8lCnUtx_9T-o'
});

/**
 * Uploads a base64 image to Cloudinary and returns the URL
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folderName - (Optional) Folder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadToCloudinary = async (base64Image, folderName=CLIENT_ID) => {
  try {
    const response = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
      folder: folderName,
      resource_type: 'image'
    });

    console.log("Uploaded To Cloudinary >> ", response);
    return response.secure_url;
  } catch (err) {
    console.error('❌ Failed to upload to Cloudinary:', err.message);
    throw err;
  }
};

module.exports = {
  uploadToCloudinary
};
