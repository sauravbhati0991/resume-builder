import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

const TemplatesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Detect current layout (student / professional / public)
  const basePath = location.pathname.startsWith("/stu")
    ? "/stu/templates"
    : location.pathname.startsWith("/pro")
    ? "/pro/templates"
    : "/templates";

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-white pt-8 sm:pt-10 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#273E9C] mb-3 sm:mb-4">
            Choose Your Category
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl sm:max-w-2xl mx-auto">
            Pick your career category — then choose a template inside it.
          </p>
        </div>

        {loading && (
          <p className="text-center text-gray-500 text-sm sm:text-base">
            Loading categories…
          </p>
        )}

        {!loading && categories.length === 0 && (
          <p className="text-center text-gray-500 text-sm sm:text-base">
            No categories found.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => navigate(`${basePath}/${c.slug}`)}
              className="text-left bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {c.name}
                </h2>

                <span
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  style={{ background: c.primaryColor }}
                />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                View templates in this category
              </p>

              <div className="mt-3 sm:mt-4 flex gap-2">
                <span
                  className="text-[10px] sm:text-xs px-2 py-1 rounded-full"
                  style={{
                    background: c.primaryColor,
                    color: c.accentColor,
                  }}
                >
                  Primary
                </span>

                <span
                  className="text-[10px] sm:text-xs px-2 py-1 rounded-full border"
                  style={{
                    borderColor: c.primaryColor,
                    color: c.primaryColor,
                  }}
                >
                  Accent
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TemplatesPage;