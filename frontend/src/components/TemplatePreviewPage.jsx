import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";

const TemplatePreviewPage = () => {
  const { templateSlug, categorySlug } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/templates/slug/${templateSlug}`)
      .then((res) => setTemplate(res.data))
      .catch(() => alert("Template not found"))
      .finally(() => setLoading(false));
  }, [templateSlug]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-white pt-8 sm:pt-10 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate(`/templates/${categorySlug}`)}
          className="border px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-white mb-5 sm:mb-6"
        >
          ← Back
        </button>

        {loading && (
          <p className="text-gray-500 text-sm sm:text-base">
            Loading…
          </p>
        )}

        {!loading && template && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">

            <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[520px] object-cover"
            />

            <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {template.name}
                </h1>

                <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
                  {template.roles?.join(", ")}
                </p>
              </div>

              <button
                onClick={() => {
                  let hasActiveSubscription = false;
                  try {
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                      const user = JSON.parse(userStr);
                      const expiry = user?.onboarding?.subscriptionExpiry;
                      if (expiry && new Date(expiry) > new Date()) {
                        hasActiveSubscription = true;
                      }
                    }
                  } catch (e) {
                    console.error("Failed to parse user data", e);
                  }

                  if (template.isPaid && !hasActiveSubscription) {
                    navigate("/pricing");
                  } else {
                    navigate(`/builder/${template.slug}`);
                  }
                }}
                className="bg-black text-white px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:opacity-90"
              >
                Use This Template
              </button>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default TemplatePreviewPage;