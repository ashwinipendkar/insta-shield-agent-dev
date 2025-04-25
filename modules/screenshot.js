const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const captureScreenshot = async () => {
  const timestamp = Date.now();
  const rawFilePath = path.join(__dirname, `../output/screenshot-raw-${timestamp}.jpg`);
  const compressedFilePath = path.join(__dirname, `../output/screenshot-compressed-${timestamp}.jpg`);

  // Step 1: Capture raw screenshot
  await screenshot({ filename: rawFilePath });

  // Step 2: Small delay to ensure file is fully saved
  await sleep(100);  // You can even increase to 300ms if needed.

  // Step 3: Compress the image
  await sharp(rawFilePath)
    .resize({ width: 1080 })
    .jpeg({ quality: 70 })
    .toFile(compressedFilePath);

  // Step 4: Try deleting the raw file (but handle EPERM errors)
  try {
    await fs.unlink(rawFilePath);
  } catch (err) {
    if (err.code === 'EPERM') {
      console.warn(`Warning: Failed to delete raw screenshot ${rawFilePath}. File might still be locked.`);
      // Optionally you can retry after few seconds, or just ignore
    } else {
      throw err; // Only throw if some other error
    }
  }

  // Step 5: Read compressed image
  const fileBuffer = await fs.readFile(compressedFilePath);
  const base64Image = fileBuffer.toString('base64');

  return { filePath: compressedFilePath, base64Image };
};

module.exports = {
  captureScreenshot,
};
