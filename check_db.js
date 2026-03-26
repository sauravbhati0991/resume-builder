const mongoose = require('mongoose');
require('dotenv').config({path: './backend/.env'});

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // We don't define the schema formally to avoid overlap if it's already in the context
    // Just use a flexible model
    const Resume = mongoose.models.Resume || mongoose.model('Resume', new mongoose.Schema({}, { strict: false, collection: 'resumes' }));
    
    const latest = await Resume.find().sort({ updatedAt: -1 }).limit(3).lean();
    console.log('LATEST_RESUMES:');
    console.log(JSON.stringify(latest, null, 2));
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
