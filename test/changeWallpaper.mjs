// changeWallpaper.js (CommonJS)
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

// For __dirname in CommonJS
const __filename = __filename || fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadImage = async (url, outputPath) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

  const fileStream = fs.createWriteStream(outputPath);
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
};

const setWallpaperFromURL = async (url) => {
  try {
    const wallpaper = await import('wallpaper'); // Dynamic import
    const fileName = path.basename(url).split('?')[0];
    const imagePath = path.join(__dirname, fileName);

    console.log('Downloading image...');
    await downloadImage(url, imagePath);

    console.log('Setting wallpaper...');
    await wallpaper.default.set(imagePath);

    console.log('Wallpaper changed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const imageUrl = 'https://your-image-url.com/wallpaper.jpg';
setWallpaperFromURL(imageUrl);
