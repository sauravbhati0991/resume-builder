const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../src/models/Category");

const categories = [
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c3a"), name: "Administrative and Support", slug: "administrative-support", primaryColor: "#D3D3D3", accentColor: "#4682B4", order: 1 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c3d"), name: "Technology and IT", slug: "technology-it", primaryColor: "#1E90FF", accentColor: "#333333", order: 2 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c40"), name: "Healthcare and Medical", slug: "healthcare-medical", primaryColor: "#7FBF7F", accentColor: "#FFFFFF", order: 3 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c43"), name: "Education", slug: "education", primaryColor: "#FF8C00", accentColor: "#000080", order: 4 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c46"), name: "Sales and Marketing", slug: "sales-marketing", primaryColor: "#FF4500", accentColor: "#FFD700", order: 5 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c49"), name: "Engineering", slug: "engineering", primaryColor: "#708090", accentColor: "#FF6347", order: 6 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c4c"), name: "Creative and Media", slug: "creative-media", primaryColor: "#800080", accentColor: "#FFFF00", order: 7 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c4f"), name: "Finance and Accounting", slug: "finance-accounting", primaryColor: "#228B22", accentColor: "#FFD700", order: 8 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c52"), name: "Manufacturing and Trades", slug: "manufacturing-trades", primaryColor: "#B7410E", accentColor: "#2F4F4F", order: 9 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c55"), name: "Customer Service", slug: "customer-service", primaryColor: "#87CEEB", accentColor: "#FFFFFF", order: 10 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c58"), name: "Legal", slug: "legal", primaryColor: "#00008B", accentColor: "#F5F5DC", order: 11 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c5b"), name: "Hospitality and Tourism", slug: "hospitality-tourism", primaryColor: "#d97706", accentColor: "#fffbeb", order: 12 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c5e"), name: "Logistics and Supply Chain", slug: "logistics-supply-chain", primaryColor: "#334155", accentColor: "#f1f5f9", order: 13 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c61"), name: "Science and Research", slug: "science-research", primaryColor: "#0d9488", accentColor: "#f0fdfa", order: 14 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c64"), name: "Public Sector and Nonprofit", slug: "public-sector-nonprofit", primaryColor: "#991b1b", accentColor: "#fef2f2", order: 15 },
  { _id: new mongoose.Types.ObjectId("698c7751e01cdb7558f68c67"), name: "Academic", slug: "academic", primaryColor: "#312e81", accentColor: "#eef2ff", order: 16 },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const cat of categories) {
      await Category.findByIdAndUpdate(cat._id, { $set: cat }, { upsert: true, new: true });
      console.log(`✅ Synced Category: ${cat.name}`);
    }

    console.log("🌱 Category seeding completed");
    process.exit();
  } catch (err) {
    console.error("❌ Seeder failed:", err.message);
    process.exit(1);
  }
}

seedCategories();