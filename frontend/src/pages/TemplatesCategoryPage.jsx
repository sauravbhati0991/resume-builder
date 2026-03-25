import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  Loader2,
  Lock,
  CheckCircle,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";

const TemplatesCategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [templates, setTemplates] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Detect base path (/stu or /pro)
  const basePath = location.pathname.startsWith("/stu")
    ? "/stu"
    : "/pro";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const catRes = await api.get("/categories");
        const currentCategory = catRes.data.find(
          (c) => c.slug === slug
        );

        if (!currentCategory) {
          navigate(`${basePath}/templates`);
          return;
        }

        setCategoryName(currentCategory.name);

        const tempRes = await api.get(
          `/templates?category=${currentCategory._id}`
        );

        setTemplates(tempRes.data);
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const handleTemplateClick = (template) => {
    if (template.isPaid) {
      navigate("/payment/checkout", { state: { template } });
    } else {
      // ✅ CORRECT BUILDER ROUTE
      navigate(`${basePath}/builder/${template._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F9FF]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF] py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ✅ Correct Back Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <button
            onClick={() => navigate(`${basePath}/templates`)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Categories
          </button>

          <div className="text-center mt-4 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#273E9C]">
              {categoryName}
            </h1>
            <p className="text-gray-500 mt-2">
              Professional templates designed for {categoryName}
            </p>
          </div>

          <div className="hidden md:block w-32"></div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              No active templates found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templates.map((template) => (
              <div
                key={template._id}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="relative h-80 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={template.previewImage || `/template-previews/${template._id}.png`}
                    onError={(e) => {
                      e.target.src = "/vite.svg";
                    }}
                    alt={template.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-3 right-3 z-10">
                    {template.isPaid ? (
                      <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Lock size={12} /> ₹{template.price}
                      </span>
                    ) : (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle size={12} /> FREE
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                    {template.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      {template.roles &&
                        template.roles.slice(0, 2).map((role, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                          >
                            {role}
                          </span>
                        ))}
                    </div>

                    <span
                      className={`text-sm font-bold ${template.isPaid
                        ? "text-gray-900"
                        : "text-green-600"
                        }`}
                    >
                      {template.isPaid
                        ? `₹${template.price}`
                        : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesCategoryPage;