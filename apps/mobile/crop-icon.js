const sharp = require('sharp');
const path = require('path');

async function cropIcon() {
  const inputPath = path.join(__dirname, 'assets', 'splash-icon.png');
  const outputPath = path.join(__dirname, '..', 'web', 'src-tauri', 'icons', 'icon.png');

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log('Original dimensions:', metadata.width, 'x', metadata.height);

    // The text is at the bottom. We'll crop out the bottom 18% of the image.
    const cropHeight = Math.floor(metadata.height * 0.82);
    
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: metadata.width, height: cropHeight })
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }) // transparent background
      .toFile(outputPath);

    console.log('Successfully cropped text out and saved to PC icon!');
  } catch (error) {
    console.error('Error cropping icon:', error);
  }
}

cropIcon();
