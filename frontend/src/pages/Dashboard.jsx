import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();

  // ===========================
  // USER FROM LOCAL STORAGE
  // ===========================
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const onboarding = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding") || "{}");
    } catch {
      return {};
    }
  }, []);

  const name = user?.fullName || user?.name || onboarding?.fullName || "Demo Student";
  const email = user?.email || onboarding?.email || "student@resumea.com";
  const initial = (name?.trim()?.[0] || "D").toUpperCase();

  const verMethod = onboarding?.verificationMethod;
  const apaarId = onboarding?.apaarId;
  const transcript = onboarding?.transcriptFileName;

  // ===========================
  // RESUMES STATE
  // ===========================
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // ===========================
  // FETCH RESUMES
  // ===========================
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/resumes/me");
      setResumes(data || []);
    } catch (err) {
      console.error("Failed to load resumes:", err);
      showToast("⚠️ Could not load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ===========================
  // FILTERED RESUMES (SEARCH)
  // ===========================
  const filteredResumes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter(
      (r) =>
        r.cvNumber?.toLowerCase().includes(q) ||
        r.templateName?.toLowerCase().includes(q) ||
        r.categoryName?.toLowerCase().includes(q)
    );
  }, [resumes, searchQuery]);

  // ===========================
  // DOWNLOAD HANDLER
  // ===========================
  const handleDownload = (resume) => {
    if (!resume.pdfUrl) {
      showToast("⚠️ No PDF found. Please open and save this resume first.");
      return;
    }
    // Open the Cloudinary URL directly — browser will download the PDF
    window.open(resume.pdfUrl, "_blank");
  };

  // ===========================
  // EDIT HANDLER
  // ===========================
  const handleEdit = (resume) => {
    navigate(`/builder/${resume.templateId}`, {
      state: { resumeData: resume.resumeData },
    });
  };

  // ===========================
  // DELETE HANDLER
  // ===========================
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    try {
      await api.delete(`/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      showToast("✅ Resume deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("⚠️ Failed to delete resume.");
    }
  };

  // ===========================
  // FORMAT DATE
  // ===========================
  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="min-h-screen bg-[#F7FBFF]">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl animate-pulse">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900">
              My Documents
            </h1>
            <p className="text-[13px] text-gray-500">
              Manage and edit your CVs
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-[320px]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by CV ID, template..."
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-5 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            <button
              onClick={() => navigate("/create-resume")}
              className="h-11 rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition"
            >
              + Create New
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* Left — Resume Cards */}
          <div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-48 rounded-2xl bg-white border border-gray-200">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading your resumes…</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && resumes.length === 0 && (
              <div
                onClick={() => navigate("/create-resume")}
                className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
              >
                <div className="flex h-[220px] flex-col items-center justify-center rounded-xl">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-600 transition">
                    +
                  </div>
                  <div className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                    Create Your First Resume
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    No resumes created yet
                  </div>
                </div>
              </div>
            )}

            {/* Resume Cards Grid */}
            {!loading && filteredResumes.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* New Doc CTA Card */}
                <div
                  onClick={() => navigate("/create-resume")}
                  className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
                >
                  <div className="flex h-[260px] flex-col items-center justify-center rounded-xl">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-600 transition">
                      +
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                      Create New Document
                    </div>
                  </div>
                </div>

                {/* Dynamic Resume Cards */}
                {filteredResumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
                  >
                    {/* Card Preview Area */}
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                          {resume.cvNumber}
                        </div>
                        {resume.pdfUrl ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            ✓ PDF Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            ⚠ No PDF
                          </span>
                        )}
                      </div>

                      {/* Preview Thumbnail Placeholder */}
                      <div className="h-[160px] rounded-xl border border-gray-100 bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center gap-2">
                        <div className="text-3xl">📄</div>
                        <div className="text-[11px] font-semibold text-gray-400">
                          {resume.templateName || "Resume"}
                        </div>
                        {resume.categoryName && (
                          <div className="text-[10px] text-gray-400">
                            {resume.categoryName}
                          </div>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3">
                        <div className="text-[14px] font-extrabold text-gray-900">
                          {resume.resumeData?.firstName
                            ? `${resume.resumeData.firstName} ${resume.resumeData.lastName || ""}`.trim()
                            : resume.templateName || "Untitled Resume"}
                        </div>
                        <div className="mt-1 text-[11px] text-gray-400">
                          Last edited: {formatDate(resume.updatedAt || resume.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 bg-gray-50/50">
                      <button
                        onClick={() => handleEdit(resume)}
                        className="flex-1 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDownload(resume)}
                        title={resume.pdfUrl ? "Download PDF" : "Save resume first to generate PDF"}
                        className={`flex-1 h-8 rounded-lg text-xs font-bold transition ${
                          resume.pdfUrl
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        ⬇ Download
                      </button>
                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="h-8 w-8 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition flex items-center justify-center"
                        title="Delete resume"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Search Results */}
            {!loading && resumes.length > 0 && filteredResumes.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                No resumes match "<strong>{searchQuery}</strong>"
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="bg-[#0B1733] px-6 py-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-xl font-extrabold">
                    {initial}
                  </div>
                  <div>
                    <div className="text-[16px] font-extrabold">{name}</div>
                    <div className="text-[12px] text-white/70">{email}</div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">
                      Student Account
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="px-6 py-5 text-center">
                  <div className="text-[20px] font-extrabold text-gray-900">
                    {loading ? "—" : resumes.length}
                  </div>
                  <div className="text-[11px] tracking-widest text-gray-400">
                    CVS
                  </div>
                </div>
                <div className="px-6 py-5 text-center">
                  <div className="text-[20px] font-extrabold text-gray-900">
                    {loading ? "—" : resumes.filter((r) => !!r.pdfUrl).length}
                  </div>
                  <div className="text-[11px] tracking-widest text-gray-400">
                    PDFS READY
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="text-[16px] font-extrabold text-gray-900">
                Verification
              </div>
              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div>
                  APAAR: {apaarId ? "✅ Verified" : "Not provided"}
                </div>
                <div>
                  Transcript: {transcript ? "✅ Uploaded" : "Not uploaded"}
                </div>
                <div>
                  Method: {verMethod || "Skipped"}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
              <div className="text-[13px] font-bold text-gray-700 mb-3">
                💡 Quick Tips
              </div>
              <ul className="space-y-2 text-[12px] text-gray-500">
                <li>• Click <strong>Edit</strong> to update your resume data.</li>
                <li>• Click <strong>Save</strong> in the builder to generate a PDF.</li>
                <li>• Click <strong>Download</strong> on any card with "PDF Ready".</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}