import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { Eye, EyeOff, Trash2, Pencil, Save, X, Plus, ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";
import AdminTemplateList from "./AdminTemplateList"; // ✅ Import the Template List component

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const AdminAddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add form state
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#ffffff");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    primaryColor: "#000000",
    accentColor: "#ffffff",
    order: 0,
  });

  // ✅ New State: Which category is expanded to show templates?
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/admin/all");
      setCategories(res.data || []);
    } catch {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const sortedCategories = useMemo(() => {
    const arr = [...categories];
    arr.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : 0;
      const bo = typeof b.order === "number" ? b.order : 0;
      if (ao !== bo) return ao - bo;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
    return arr;
  }, [categories]);

  // --- HANDLERS (Add, Toggle, Delete, Edit) ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/categories", {
        name: name.trim(),
        slug: slugify(name),
        primaryColor,
        accentColor,
      });
      alert("✅ Category added");
      setName("");
      setPrimaryColor("#000000");
      setAccentColor("#ffffff");
      fetchCategories();
    } catch {
      alert("❌ Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = async (id) => {
    try {
      await api.patch(`/categories/${id}/toggle`);
      fetchCategories();
    } catch { alert("Failed to toggle"); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Disable this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch { alert("Failed to delete"); }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({
      name: cat.name || "",
      primaryColor: cat.primaryColor || "#000000",
      accentColor: cat.accentColor || "#ffffff",
      order: typeof cat.order === "number" ? cat.order : 0,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/categories/${id}`, {
        ...editForm,
        slug: slugify(editForm.name),
        order: Number(editForm.order) || 0,
      });
      alert("✅ Category updated");
      setEditingId(null);
      fetchCategories();
    } catch { alert("Failed to update"); }
  };

  // ✅ Toggle Template View
  const toggleTemplatesView = (id) => {
    if (expandedCategoryId === id) {
      setExpandedCategoryId(null); // Close if already open
    } else {
      setExpandedCategoryId(id); // Open new
    }
  };

  return (
    <div className="space-y-10">
      {/* ADD FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Plus className="text-blue-600"/> Add Resume Category
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <input
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category Name (e.g. Technology & IT)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Primary Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                <span className="text-sm text-gray-600">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accent Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                <span className="text-sm text-gray-600">{accentColor}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Existing Categories</h2>
        
        <div className="space-y-4">
          {sortedCategories.map((c, idx) => {
            const isEditing = editingId === c._id;
            const isExpanded = expandedCategoryId === c._id;

            return (
              <div key={c._id} className={`border rounded-lg transition overflow-hidden ${!c.isActive ? "bg-gray-50 opacity-75" : "bg-white"} ${isExpanded ? "ring-2 ring-blue-100 shadow-md" : ""}`}>
                
                {/* --- Row Content --- */}
                <div className="p-4">
                  {!isEditing ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-mono text-sm w-6">#{idx + 1}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{c.name}</h3>
                          <p className="text-xs text-gray-400 font-mono">{c.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="w-5 h-5 rounded-full shadow-sm" style={{background: c.primaryColor}} title="Primary"/>
                          <span className="w-5 h-5 rounded-full border shadow-sm" style={{background: c.accentColor}} title="Accent"/>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3">
                        {/* ✅ MANAGE TEMPLATES BUTTON */}
                        <button 
                          onClick={() => toggleTemplatesView(c._id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition ${isExpanded ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          <LayoutGrid size={16} /> 
                          {isExpanded ? "Close Templates" : "Manage Templates"}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        <button onClick={() => toggleCategory(c._id)} className={`text-sm flex items-center gap-1 ${c.isActive ? "text-gray-500 hover:text-gray-700" : "text-green-600 hover:text-green-700"}`}>
                          {c.isActive ? <Eye size={16}/> : <EyeOff size={16}/>}
                        </button>
                        <button onClick={() => startEdit(c)} className="text-blue-600 text-sm flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                          <Pencil size={16}/>
                        </button>
                        <button onClick={() => deleteCategory(c._id)} className="text-red-500 text-sm flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                      <input className="w-full border p-2 rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <div className="flex gap-4">
                        <input type="color" value={editForm.primaryColor} onChange={e => setEditForm({...editForm, primaryColor: e.target.value})} />
                        <input type="color" value={editForm.accentColor} onChange={e => setEditForm({...editForm, accentColor: e.target.value})} />
                        <input type="number" className="w-20 border p-1 rounded" value={editForm.order} onChange={e => setEditForm({...editForm, order: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(c._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Save size={14}/> Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><X size={14}/> Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ EXPANDED SECTION: Show Templates for this Category */}
                {isExpanded && (
                  <div className="border-t border-blue-100 bg-blue-50/30 p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <LayoutGrid size={16} className="text-blue-600" /> 
                      Templates in "{c.name}"
                    </h4>
                    {/* Reusing your existing AdminTemplateList to handle price toggling */}
                    <AdminTemplateList categoryId={c._id} />
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAddCategory;