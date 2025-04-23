// modules/screenshot.js

const screenshot = require('screenshot-desktop');
const path = require('path');

const captureScreenshot = async () => {
  const filePath = path.join(__dirname, `../output/screenshot-${Date.now()}.jpg`);
  await screenshot({ filename: filePath });
  return filePath;
};

module.exports = {
  captureScreenshot,
};
