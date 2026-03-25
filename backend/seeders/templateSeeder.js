const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../src/models/Category");
const Template = require("../src/models/Template");

// EXACT data mapping to force permanent ID synchronisation
const templatesToSeed = [
  // Administrative
  { _id: "699495f29845ed80af9ba167", name: "Executive Assistant Elite", cSlug: "administrative-support" },
  { _id: "699495f39845ed80af9ba169", name: "Operations Coordinator Pro", cSlug: "administrative-support" },
  { _id: "699495f39845ed80af9ba16a", name: "Admin Specialist Modern", cSlug: "administrative-support" },
  { _id: "699495f29845ed80af9ba168", name: "Office Manager Pro", cSlug: "administrative-support" },
  { _id: "699495f39845ed80af9ba16b", name: "Project Support Expert", cSlug: "administrative-support" },
  // Technology
  { _id: "699495f39845ed80af9ba16d", name: "Cloud Architect Elite", cSlug: "technology-it" },
  { _id: "699495f39845ed80af9ba16e", name: "Data Scientist Modern", cSlug: "technology-it" },
  { _id: "699495f39845ed80af9ba16f", name: "Cybersecurity Analyst Pro", cSlug: "technology-it" },
  { _id: "699495f39845ed80af9ba170", name: "IT Manager Portfolio", cSlug: "technology-it" },
  { _id: "699495f39845ed80af9ba16c", name: "Full Stack Dev Pro", cSlug: "technology-it" },
  // Healthcare
  { _id: "699495f49845ed80af9ba171", name: "Nurse Practitioner Elite", cSlug: "healthcare-medical" },
  { _id: "699495f49845ed80af9ba172", name: "Medical Director Pro", cSlug: "healthcare-medical" },
  { _id: "699495f49845ed80af9ba173", name: "Clinical Pharmacist Modern", cSlug: "healthcare-medical" },
  { _id: "699495f49845ed80af9ba174", name: "Physical Therapist Pro", cSlug: "healthcare-medical" },
  { _id: "699495f49845ed80af9ba175", name: "Healthcare Admin Lead", cSlug: "healthcare-medical" },
  // Education
  { _id: "699495f49845ed80af9ba176", name: "Senior Educator Elite", cSlug: "education" },
  { _id: "699495f49845ed80af9ba177", name: "Academic Director Pro", cSlug: "education" },
  { _id: "699495f49845ed80af9ba178", name: "Special Ed Expert Pro", cSlug: "education" },
  { _id: "699495f49845ed80af9ba179", name: "University Professor Portfolio", cSlug: "education" },
  { _id: "699495f59845ed80af9ba17a", name: "Curriculum Designer Pro", cSlug: "education" },
  // Sales
  { _id: "699495f59845ed80af9ba17b", name: "Marketing Director Elite", cSlug: "sales-marketing" },
  { _id: "699495f59845ed80af9ba17c", name: "Sales Executive Pro", cSlug: "sales-marketing" },
  { _id: "699495f59845ed80af9ba17d", name: "Brand Strategy Modern", cSlug: "sales-marketing" },
  { _id: "699495f59845ed80af9ba17e", name: "Digital Growth Pro", cSlug: "sales-marketing" },
  { _id: "699495f59845ed80af9ba17f", name: "Account Manager Portfolio", cSlug: "sales-marketing" },
  // Engineering
  { _id: "699495f69845ed80af9ba180", name: "Structural Engineer Elite", cSlug: "engineering" },
  { _id: "699495f69845ed80af9ba181", name: "Mechanical Design Pro", cSlug: "engineering" },
  { _id: "699495f69845ed80af9ba182", name: "Electrical Systems Pro", cSlug: "engineering" },
  { _id: "699495f69845ed80af9ba183", name: "Project Engineer Modern", cSlug: "engineering" },
  { _id: "699495f69845ed80af9ba184", name: "Reliability Engineer Pro", cSlug: "engineering" },
  // Creative
  { _id: "699495f69845ed80af9ba185", name: "Creative Director Elite", cSlug: "creative-media" },
  { _id: "699495f69845ed80af9ba186", name: "Art Director Pro", cSlug: "creative-media" },
  { _id: "699495f69845ed80af9ba187", name: "UX/UI Designer Modern", cSlug: "creative-media" },
  { _id: "699495f69845ed80af9ba188", name: "Content Strategy Pro", cSlug: "creative-media" },
  { _id: "699495f69845ed80af9ba189", name: "Multimedia Designer Portfolio", cSlug: "creative-media" },
  // Finance
  { _id: "699495f79845ed80af9ba18a", name: "Investment Banker Elite", cSlug: "finance-accounting" },
  { _id: "699495f79845ed80af9ba18b", name: "Chartered Accountant Pro", cSlug: "finance-accounting" },
  { _id: "699495f79845ed80af9ba18c", name: "Internal Auditor Expert", cSlug: "finance-accounting" },
  { _id: "699495f79845ed80af9ba18d", name: "Tax Consultant Modern", cSlug: "finance-accounting" },
  { _id: "699495f79845ed80af9ba18e", name: "Financial Analyst Pro", cSlug: "finance-accounting" },
  // Manufacturing
  { _id: "699495f89845ed80af9ba18f", name: "Operations Specialist Pro", cSlug: "manufacturing-trades" },
  { _id: "699495f89845ed80af9ba190", name: "Quality Control Engineer Elite", cSlug: "manufacturing-trades" },
  { _id: "699495f89845ed80af9ba191", name: "Industrial Technician Modern", cSlug: "manufacturing-trades" },
  { _id: "699495f89845ed80af9ba192", name: "Industrial Mechanic Expert", cSlug: "manufacturing-trades" },
  { _id: "699495f89845ed80af9ba193", name: "Safety Compliance Lead", cSlug: "manufacturing-trades" },
  // Customer Service
  { _id: "699495f99845ed80af9ba194", name: "Call Center Lead Pro", cSlug: "customer-service" },
  { _id: "699495f99845ed80af9ba195", name: "Retail Manager Elite", cSlug: "customer-service" },
  { _id: "699495f99845ed80af9ba196", name: "Client Relations Expert", cSlug: "customer-service" },
  { _id: "699495f99845ed80af9ba197", name: "Support Specialist Modern", cSlug: "customer-service" },
  { _id: "699495f99845ed80af9ba198", name: "Customer Success Lead", cSlug: "customer-service" },
  // Legal
  { _id: "699495f99845ed80af9ba199", name: "Corporate Counsel Elite", cSlug: "legal" },
  { _id: "699495f99845ed80af9ba19a", name: "Trial Attorney Pro", cSlug: "legal" },
  { _id: "699495f99845ed80af9ba19b", name: "Compliance Officer Modern", cSlug: "legal" },
  { _id: "699495f99845ed80af9ba19c", name: "Paralegal Specialist", cSlug: "legal" },
  { _id: "699495f99845ed80af9ba19d", name: "Contract Negotiator Pro", cSlug: "legal" },
  // Hospitality
  { _id: "699495fa9845ed80af9ba19e", name: "Executive Chef Elite", cSlug: "hospitality-tourism" },
  { _id: "699495fa9845ed80af9ba19f", name: "Hotel Manager Pro", cSlug: "hospitality-tourism" },
  { _id: "699495fa9845ed80af9ba1a0", name: "Travel Consultant Expert", cSlug: "hospitality-tourism" },
  // Logistics
  { _id: "699495fa9845ed80af9ba1a1", name: "Supply Chain Director Elite", cSlug: "logistics-supply-chain" },
  { _id: "699495fa9845ed80af9ba1a2", name: "Warehouse operations Pro", cSlug: "logistics-supply-chain" },
  { _id: "699495fa9845ed80af9ba1a3", name: "Logistics Manager Modern", cSlug: "logistics-supply-chain" },
  // Science
  { _id: "699495fa9845ed80af9ba1a8", name: "Research Scientist Expert", cSlug: "science-research" },
  { _id: "699495fa9845ed80af9ba1a9", name: "Biotech Analyst Pro", cSlug: "science-research" },
  { _id: "699495fa9845ed80af9ba1ab", name: "Lab Manager Modern", cSlug: "science-research" },
  // Public Sector
  { _id: "699495fa9845ed80af9ba1ac", name: "Public Sector Director Elite", cSlug: "public-sector-nonprofit" },
  { _id: "699495fa9845ed80af9ba1ad", name: "Nonprofit Manager Pro", cSlug: "public-sector-nonprofit" },
  { _id: "699495fa9845ed80af9ba1ae", name: "Policy Analyst Modern", cSlug: "public-sector-nonprofit" },
  // Academic
  { _id: "699496019845ed80af9ba1e0", name: "Graduate Fellow Elite", cSlug: "academic" },
  { _id: "699496019845ed80af9ba1e1", name: "Research Professor Pro", cSlug: "academic" },
  { _id: "699496019845ed80af9ba1e2", name: "PhD Candidate Modern", cSlug: "academic" },
  { _id: "699496019845ed80af9ba1e3", name: "Academic Director Expert", cSlug: "academic" },
  { _id: "699496019845ed80af9ba1e4", name: "Senior Researcher Portfolio", cSlug: "academic" }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully.");

    console.log("🧹 Clearing old templates to fix ID formatting...");
    await Template.deleteMany({});
    console.log("✅ Old templates cleared!");

    let successCount = 0;
    let failCount = 0;

    console.log(`⏳ Attempting to seed ${templatesToSeed.length} templates...`);

    for (const t of templatesToSeed) {
      try {
        const category = await Category.findOne({ slug: t.cSlug });
        
        if (!category) {
          console.log(`⚠️ Skipped: "${t.name}" -> Category slug "${t.cSlug}" not found in DB.`);
          failCount++;
          continue; 
        }

        const objectId = new mongoose.Types.ObjectId(t._id);
        const cleanRole = t.name.replace(/( Elite| Pro| Modern| Expert| Portfolio| Specialist| Lead)$/, "");

        const payload = {
          _id: objectId, 
          name: t.name,
          slug: t._id, 
          category: category._id,
          roles: [cleanRole],
          previewImage: `https://via.placeholder.com/400x550.png?text=${encodeURIComponent(t.name)}`,
          primaryColor: category.primaryColor,
          accentColor: category.accentColor,
          isPaid: false,
          price: 0,
          html: `<div style="font-family:Arial;padding:24px"><h1 style="margin:0;color:${category.accentColor}">${t.name}</h1></div>`,
          css: "/* Default CSS required by schema */", 
          isActive: true,
        };

        await Template.create(payload);
        console.log(`✅ Inserted: ${t.name}`);
        successCount++;

      } catch (innerError) {
        console.log(`❌ Failed on template "${t.name}":`, innerError.message);
        failCount++;
      }
    }

    console.log(`\n🎉 SEEDING COMPLETE!`);
    console.log(`🟢 Successfully added: ${successCount}`);
    console.log(`🔴 Failed or Skipped: ${failCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal Seeder Error:", err);
    process.exit(1);
  }
}

seedTemplates();