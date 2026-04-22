import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  ArrowLeft,
  IndianRupee,
  Crown,
  X,
} from "lucide-react";

const TemplatesCategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [templates, setTemplates] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPaidPopup, setShowPaidPopup] = useState(false);

  const isSubscribed = (() => {
    try {
      const uStr = localStorage.getItem("user");
      const oStr = localStorage.getItem("onboarding");
      const u = uStr ? JSON.parse(uStr) : {};
      const o = oStr ? JSON.parse(oStr) : {};
      const expiry = u?.onboarding?.subscriptionExpiry || o?.subscriptionExpiry;
      return expiry && new Date(expiry) > new Date();
    } catch (e) {
      return false;
    }
  })();

  const toggleSubscription = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};
      const isCurrentlyPaid = user?.onboarding?.subscriptionExpiry && new Date(user.onboarding.subscriptionExpiry) > new Date();
      const newExpiry = isCurrentlyPaid ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      
      try {
        await api.patch("/users/me/onboarding", { subscriptionExpiry: newExpiry });
      } catch (e) {}

      if (!user.onboarding) user.onboarding = {};
      user.onboarding.subscriptionExpiry = newExpiry;
      localStorage.setItem("user", JSON.stringify(user));

      const oStr = localStorage.getItem("onboarding");
      const o = oStr ? JSON.parse(oStr) : {};
      o.subscriptionExpiry = newExpiry;
      localStorage.setItem("onboarding", JSON.stringify(o));

      alert(isCurrentlyPaid ? "DEBUG: Subscription Removed (Not Paid)" : "DEBUG: Subscription Active (Paid 1 year)");
      window.location.reload();
    } catch (e) {
      alert("Failed to toggle");
    }
  };

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
    let hasActiveSubscription = false;
    try {
      const userStr = localStorage.getItem("user");
      const onboardingStr = localStorage.getItem("onboarding");
      const user = userStr ? JSON.parse(userStr) : {};
      const onboarding = onboardingStr ? JSON.parse(onboardingStr) : {};
      
      const expiry = user?.onboarding?.subscriptionExpiry || onboarding?.subscriptionExpiry;
      
      if (expiry && new Date(expiry) > new Date()) {
        hasActiveSubscription = true;
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }

    if (template.isPaid && !hasActiveSubscription) {
      setShowPaidPopup(true);
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
                        {isSubscribed ? <Unlock size={12} /> : <Lock size={12} />} PAID
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
                        ? "Paid"
                        : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paid Required Modal */}
        {showPaidPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 relative">
              <button 
                onClick={() => setShowPaidPopup(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
              
              <div className="p-8 text-center mt-2">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200/50">
                  <Crown size={36} strokeWidth={2.5} className="mt-[-2px]" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Paid Template</h3>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  Upgrade your account to activate this design and seamlessly unlock all paid resume templates.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate(`${basePath}/pricing`)}
                    className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-extrabold tracking-wide shadow-lg shadow-yellow-200 hover:from-yellow-300 hover:to-yellow-400 hover:-translate-y-0.5 transition-all text-sm uppercase"
                  >
                    Unlock Now
                  </button>
                  <button
                    onClick={() => setShowPaidPopup(false)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition text-sm"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Section */}
        <div className="mt-12 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <button
            onClick={toggleSubscription}
            className="text-xs font-black uppercase tracking-tighter text-gray-500 border border-gray-300 px-4 py-2 rounded-full hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 transition shadow-sm"
          >
            Debug: Toggle Paid Access
          </button>
        </div>

      </div>
    </div>
  );
};

export default TemplatesCategoryPage;