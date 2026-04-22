import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Eye, EyeOff, Trash2, Edit3, X, Save, IndianRupee, Lock, CheckCircle, AlertCircle } from "lucide-react";

const AdminTemplateList = ({ categoryId }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- EDIT MODAL STATE ---
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    previewImage: "",
    isPaid: false,
    price: 0
  });

  // Fetch templates when category changes
  const fetchTemplates = async () => {
    if (!categoryId) {
      setTemplates([]);
      return;
    }
    setLoading(true);
    try {
      // Ensure backend supports filtering by category
      const res = await api.get(`/templates/admin/all?category=${categoryId}`);
      setTemplates(res.data);
    } catch {
      console.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryId]);

  // --- ACTIONS ---

  // 1. Toggle Visibility
  const toggleVisibility = async (id) => {
    try {
      await api.patch(`/templates/${id}/toggle`);
      // Optimistic update
      setTemplates(prev => prev.map(t => t._id === id ? { ...t, isActive: !t.isActive } : t));
    } catch (e) {
      alert("Failed to toggle visibility");
    }
  };

  // 2. Delete Template
  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template permanently? This cannot be undone.")) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      alert("Failed to delete");
    }
  };

  // 3. Open Edit Modal
  const handleEditClick = (template) => {
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      previewImage: template.previewImage,
      isPaid: template.isPaid,
      price: template.price || 0
    });
  };

  // 4. Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      await api.put(`/templates/${editingTemplate._id}`, {
        ...editForm,
        // Logic: If switching to Free, force price to 0
        price: editForm.isPaid ? Number(editForm.price) : 0
      });

      alert("✅ Template Updated Successfully!");
      setEditingTemplate(null);
      fetchTemplates(); // Refresh list to show changes
    } catch (error) {
      console.error(error);
      alert("Failed to update template");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative mt-6">

      {/* Header State Handling */}
      {!categoryId ? (
        <div className="text-center py-12 flex flex-col items-center justify-center text-gray-500">
          <AlertCircle size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium">No Category Selected</p>
          <p className="text-sm">Please select a category above to manage its templates.</p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-lg font-medium text-gray-700">No Templates Found</p>
          <p className="text-sm">Add a new template using the form above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((t) => (
            <div key={t._id} className={`border rounded-xl overflow-hidden transition bg-white group relative shadow-sm hover:shadow-md ${!t.isActive ? "opacity-75 bg-gray-50 border-gray-300" : "border-gray-200"}`}>

              {/* Image & Badges */}
              <div className="relative h-48 bg-gray-100 group-hover:opacity-90 transition">
                <img src={t.previewImage} alt={t.name} className="w-full h-full object-cover object-top" />

                {/* Price Badge */}
                <div className="absolute top-2 right-2">
                  {t.isPaid ? (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                      <Lock size={10} /> PAID
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                      <CheckCircle size={10} /> FREE
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-2 left-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.isActive ? "bg-white text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                    {t.isActive ? "ACTIVE" : "HIDDEN"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate text-sm mb-1" title={t.name}>{t.name}</h3>
                <p className="text-xs text-gray-400 mb-4 truncate">{t._id}</p>

                {/* Actions */}
                <div className="flex items-center justify-between border-t pt-3">
                  <button
                    onClick={() => toggleVisibility(t._id)}
                    className={`p-2 rounded transition ${t.isActive ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-green-600 hover:bg-green-50"}`}
                    title={t.isActive ? "Hide Template" : "Show Template"}
                  >
                    {t.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  {/* EDIT BUTTON - CLICK THIS TO CHANGE PRICE */}
                  <button
                    onClick={() => handleEditClick(t)}
                    className="p-2 rounded text-blue-600 hover:bg-blue-50 transition"
                    title="Edit Template Details"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    onClick={() => deleteTemplate(t._id)}
                    className="p-2 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= EDIT MODAL (PRICE CONTROL) ================= */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Edit Template</h3>
              <button onClick={() => setEditingTemplate(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview Image URL</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={editForm.previewImage}
                  onChange={(e) => setEditForm({ ...editForm, previewImage: e.target.value })}
                  required
                />
              </div>

              {/* --- PRICE CONTROL --- */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Is this a Paid Template?</span>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isPaid: !editForm.isPaid })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${editForm.isPaid ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isPaid ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center gap-2 shadow-sm transition"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplateList;