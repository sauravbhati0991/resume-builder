const axios = require('axios');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({path: './backend/.env'});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  const cvNumber = 'CV-TEST-AUTH-2';
  const publicId = `resumea/resumes/${cvNumber}`;
  
  console.log('--- TESTING AUTHENTICATED UPLOAD WITH VALID PDF ---');
  try {
    const dummyBuffer = Buffer.from('%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 0 >>\nstream\nendstream\nendobj\ntrailer\n<< /Size 5 /Root 1 0 R >>\n%%EOF');
    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'resumea/resumes',
        resource_type: 'image',
        public_id: cvNumber,
        type: 'authenticated', // Testing authenticated type
        format: 'pdf'
      }, (err, res) => err ? reject(err) : resolve(res)).end(dummyBuffer);
    });
    console.log('UPLOAD SUCCESS:', upload.secure_url);

    // Generate signed URL for authenticated resource
    const url = cloudinary.url(upload.public_id, {
      resource_type: 'image',
      type: 'authenticated',
      sign_url: true,
      secure: true,
      format: 'pdf'
    });
    console.log('SIGNED URL:', url);

    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    console.log(`FETCH SUCCESS [${resp.status}]: Signed URL for authenticated worked!`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    if (err.response) console.log(err.response.data.toString());
  }
}

test();
