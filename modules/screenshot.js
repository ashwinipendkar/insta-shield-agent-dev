const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs/promises');
const { uploadToCloudinary } = require('../utils/uploadToCloudinary');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const captureScreenshot = async (CLIENT_ID) => {
  const timestamp = Date.now();
  const screenshotsDir = 'C:/screenshots'; // Directory on C drive
  const filePath = path.join(screenshotsDir, `screenshot-${timestamp}.jpg`);

  // Step 1: Ensure the directory exists
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }

  // Step 2: Capture raw screenshot
  await screenshot({ filename: filePath });

  // Step 3: Wait briefly to ensure the file is saved
  await sleep(100);

  // Step 4: Read the image and convert to base64
  const fileBuffer = await fs.readFile(filePath);
  const base64Image = fileBuffer.toString('base64');

  const imageURL = await uploadToCloudinary(base64Image, CLIENT_ID)

  console.log("IMAGE URL >> ", imageURL);



  return { filePath, imageURL };
}

module.exports = {
  captureScreenshot,
};
