require('dotenv').config();
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'LOADED' : 'MISSING');
console.log('VALUE_START:', process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.substring(0, 3) : 'N/A');
process.exit();
