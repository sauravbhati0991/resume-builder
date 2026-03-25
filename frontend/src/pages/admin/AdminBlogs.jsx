import { useEffect, useRef, useState } from "react";
import api from "../../utils/api";

export default function AdminBlogs() {
  const fileRef = useRef(null);
  const editFileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [msg, setMsg] = useState("");

  // EDIT MODAL
  const [editing, setEditing] = useState(null); // blog object
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadBlogs = async () => {
    try {
      setLoadingList(true);
      const res = await api.get("/admin/blogs");
      setBlogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!title.trim() || !description.trim() || !image) {
      setMsg("Title, description and image are required.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("image", image);

      await api.post("/admin/blogs", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setDescription("");
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
      setMsg("✅ Blog added!");
      await loadBlogs();
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "Failed to add blog");
    } finally {
      setLoading(false);
    }
  };

  const onToggle = async (id) => {
    try {
      setMsg("");
      await api.patch(`/admin/blogs/${id}/toggle`);
      await loadBlogs();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to toggle blog");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;

    try {
      setMsg("");
      await api.delete(`/admin/blogs/${id}`);
      await loadBlogs();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to delete blog");
    }
  };

  const openEdit = (b) => {
    setEditing(b);
    setEditTitle(b.title || "");
    setEditDesc(b.description || "");
    setEditImage(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle("");
    setEditDesc("");
    setEditImage(null);
  };

  const saveEdit = async () => {
    if (!editing?._id) return;

    if (!editTitle.trim() || !editDesc.trim()) {
      setMsg("Edit title & description required.");
      return;
    }

    try {
      setSavingEdit(true);
      setMsg("");

      const fd = new FormData();
      fd.append("title", editTitle.trim());
      fd.append("description", editDesc.trim());
      if (editImage) fd.append("image", editImage);

      await api.put(`/admin/blogs/${editing._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("✅ Blog updated!");
      closeEdit();
      await loadBlogs();
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "Failed to update blog");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* CREATE */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h2 className="text-xl font-extrabold text-gray-900">Add New Blog</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload image + title + description (shows on landing page)
        </p>

        <form onSubmit={onCreate} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600">TITLE</label>
            <input
              className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Eg: How to build ATS friendly resume"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">DESCRIPTION</label>
            <textarea
              className="mt-2 w-full min-h-[110px] rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write blog description..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">IMAGE</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          {msg && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 px-6 rounded-xl bg-[#0B1733] text-white font-extrabold hover:bg-[#071028] transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Publish Blog"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-gray-900">All Blogs</h2>
          <button
            onClick={loadBlogs}
            className="h-9 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200"
          >
            {loadingList ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {blogs.map((b) => (
            <div key={b._id} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-40 bg-gray-100">
                <img src={b.imageUrl} alt={b.title} className="w-full h-40 object-cover" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-extrabold text-gray-900 line-clamp-1">{b.title}</div>
                  <span
                    className={[
                      "text-xs font-bold px-2 py-1 rounded-full",
                      b.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600",
                    ].join(" ")}
                  >
                    {b.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{b.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => openEdit(b)}
                    className="h-9 px-4 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onToggle(b._id)}
                    className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                  >
                    {b.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => onDelete(b._id)}
                    className="h-9 px-4 rounded-lg bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loadingList && !blogs.length && (
            <div className="text-gray-500 text-sm">No blogs yet.</div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold text-gray-900">Edit Blog</div>
                <div className="text-xs text-gray-500">Update title/description and optionally replace image</div>
              </div>
              <button
                onClick={closeEdit}
                className="h-9 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600">TITLE</label>
                <input
                  className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-blue-200"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">DESCRIPTION</label>
                <textarea
                  className="mt-2 w-full min-h-[110px] rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">REPLACE IMAGE (optional)</label>
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeEdit}
                  className="h-11 px-5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="h-11 px-6 rounded-xl bg-[#0B1733] text-white font-extrabold hover:bg-[#071028] transition disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}