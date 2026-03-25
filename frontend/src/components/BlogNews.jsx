import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "How to Beat the ATS in 2026",
    excerpt: "Learn the exact keywords and formatting tricks to ensure your resume passes automated screening systems.",
    category: "Tips",
    date: "Feb 14, 2026",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    title: "Top 5 High-Paying Tech Roles This Year",
    excerpt: "Discover which tech positions are seeing the highest salary bumps and how to tailor your resume for them.",
    category: "Career News",
    date: "Feb 10, 2026",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    title: "Why Minimalist Resumes Win More Interviews",
    excerpt: "Cluttered designs are out. See why recruiters prefer clean, single-column minimalist templates.",
    category: "Design",
    date: "Feb 05, 2026",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400"
  }
];

const BlogNews = () => {
  return (
    <section className="py-14 sm:py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Career Insights & <span className="text-blue-600">News</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Expert advice to help you land your dream job faster.
            </p>
          </motion.div>
          
          <motion.a 
            href="#" 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition text-sm sm:text-base"
          >
            View all articles <ArrowRight size={18} />
          </motion.a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
            >
              <div className="h-40 sm:h-44 md:h-48 overflow-hidden relative">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide">
                  {article.category}
                </span>
              </div>
              
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">
                  <Clock size={14} /> {article.date}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <a
                  href="#"
                  className="text-blue-600 text-sm sm:text-base font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Read more <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogNews;