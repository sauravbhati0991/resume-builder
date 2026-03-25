require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("./src/models/Template");

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const template = await Template.findOne();
    console.log(`\nSample Template ID: ${template._id}`);
    console.log(`Sample Template Name: ${template.name}`);
    console.log(`Sample Template URL: ${template.previewImage}`);
  } catch(e) { console.error(e); } 
  finally { mongoose.connection.close(); }
}
checkDb();
