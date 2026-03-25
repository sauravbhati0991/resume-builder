import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Loader2, Plus, IndianRupee } from "lucide-react";

const AdminAddTemplate = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    roles: "",
    previewImage: "",
    html: "",
    css: "",
    isPaid: false, // Default to Free
    price: 0,
  });

  // Fetch Categories on Mount
  useEffect(() => {
    api.get("/categories/admin/all") // Use admin endpoint to get even hidden categories
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  // Update Parent Component when Category Changes
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData({ ...formData, category: catId });
    if (onCategoryChange) onCategoryChange(catId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure price is 0 if Free
      const payload = {
        ...formData,
        price: formData.isPaid ? Number(formData.price) : 0,
        roles: formData.roles.split(",").map((r) => r.trim()).filter(Boolean), // Clean CSV
      };

      await api.post("/templates", payload);
      alert("✅ Template Added Successfully!");
      
      // Reset Form (keep category selected for convenience)
      setFormData({
        ...formData,
        name: "",
        roles: "",
        previewImage: "",
        html: "",
        css: "",
        isPaid: false,
        price: 0,
      });

      // Trigger refresh in parent list if connected
      if (onCategoryChange) onCategoryChange(formData.category);

    } catch (error) {
      console.error(error);
      alert("❌ Failed to add template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Plus className="text-blue-600" /> Add New Template
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* 1. Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {!c.isActive && "(Hidden)"}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Modern Tech Resume"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* 3. Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roles (comma separated)</label>
            <input
              type="text"
              placeholder="Software Engineer, Product Manager..."
              value={formData.roles}
              onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* 4. Preview Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview Image URL</label>
            <input
              required
              type="text"
              placeholder="https://..."
              value={formData.previewImage}
              onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

        </div>

        {/* --- PRICING CONTROL SECTION --- */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-bold text-gray-800">Is this a Paid Template?</span>
          </label>

          {formData.isPaid && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (INR)</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-2.5 text-gray-500"><IndianRupee size={16}/></span>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="99"
                />
              </div>
            </div>
          )}
        </div>

        {/* HTML & CSS Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HTML Structure</label>
            <textarea
              required
              rows={4}
              value={formData.html}
              onChange={(e) => setFormData({ ...formData, html: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="<div>...</div>"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSS Styles</label>
            <textarea
              required
              rows={4}
              value={formData.css}
              onChange={(e) => setFormData({ ...formData, css: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder=".class { color: red; }"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Plus />}
          Create Template
        </button>
      </form>
    </div>
  );
};

export default AdminAddTemplate;