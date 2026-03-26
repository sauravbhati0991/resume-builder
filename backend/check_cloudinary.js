const cloudinary = require('cloudinary').v2;
require('dotenv').config({path: './backend/.env'});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function check() {
  const cvNumber = process.argv[2];
  if (!cvNumber) {
    console.error('Please provide a cvNumber');
    process.exit(1);
  }

  const publicId = `resumea/resumes/${cvNumber}`;
  
  try {
    console.log(`Checking for ${publicId} ...`);
    
    // Check as image
    try {
      const resultImage = await cloudinary.api.resource(publicId, { resource_type: 'image' });
      console.log('FOUND AS IMAGE:', resultImage.secure_url);
    } catch (e) {
      console.log('NOT FOUND AS IMAGE');
    }

    // Check as raw
    try {
      const resultRaw = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
      console.log('FOUND AS RAW:', resultRaw.secure_url);
    } catch (e) {
      console.log('NOT FOUND AS RAW');
    }

  } catch (err) {
    console.error('Error detail:', err.message);
  }
}

check();
