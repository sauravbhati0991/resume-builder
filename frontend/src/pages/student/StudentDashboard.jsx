import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function StudentDashboard() {

  const navigate = useNavigate();

  // ===============================
  // USER DATA
  // ===============================
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const name = user?.fullName || user?.name || "Student";
  const email = user?.email || "student@resumea.com";
  const initial = (name?.trim()?.[0] || "S").toUpperCase();

  const [cvNumber, setCvNumber] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH USER RESUMES
  // ===============================
  const fetchResumes = async () => {
    try {
      const { data } = await api.get("/resumes/me");
      setResumes(data || []);
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ===============================
  // SEARCH BY CV NUMBER
  // ===============================
  const handleSearch = async (e) => {
    e.preventDefault();

    const cv = cvNumber.trim();
    if (!cv) return;

    try {
      const { data } = await api.get(`/resumes/cv/${cv}`);

      if (data?.cvNumber) {
        window.open(
          `${import.meta.env.VITE_API_BASE_URL}/resumes/view/${data.cvNumber}`,
          "_blank"
        );
      } else {
        alert("Resume PDF not uploaded yet.");
      }
    } catch (err) {
      console.error(err);
      alert("Resume not found");
    }
  };

  // ===============================
  // DELETE RESUME
  // ===============================
  const deleteResume = async (resumeId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {

      await api.delete(`/resumes/${resumeId}`);

      setResumes((prev) =>
        prev.filter((resume) => resume._id !== resumeId)
      );

    } catch (err) {

      console.error("Delete failed:", err);
      alert("Failed to delete resume");

    }

  };

  const handleDownload = async (cvNumber) => {
    try {
      const res = await api.get(`/resumes/view/${cvNumber}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <section className="min-h-screen bg-[#F7FBFF] flex flex-col">

      <div className="mx-auto w-full max-w-6xl px-5 py-10 flex-1">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h1 className="text-[28px] font-extrabold text-gray-900">
              Welcome, {name}
            </h1>

            <p className="mt-1 text-[13px] text-gray-500">
              Build resumes faster with ready templates + CV access.
            </p>

          </div>

          <button
            onClick={() => navigate("/stu/templates")}
            className="h-11 rounded-xl bg-[#0B1733] px-6 text-sm font-extrabold text-white shadow-lg hover:bg-[#071028] transition"
          >
            + Create New
          </button>

        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] items-start">

          {/* LEFT SIDE */}
          <div>

            {/* CV SEARCH */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">

              <div className="text-[15px] font-extrabold text-gray-900">
                Enter CV Number
              </div>

              <p className="mt-1 text-[12px] text-gray-500">
                Example: CV-8H2K-41P9
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
              >

                <input
                  value={cvNumber}
                  onChange={(e) => setCvNumber(e.target.value)}
                  placeholder="CV-8H2K-41P9"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />

                <button
                  type="submit"
                  disabled={!cvNumber.trim()}
                  className={[
                    "h-11 rounded-xl px-5 text-sm font-bold shadow-sm transition",
                    cvNumber.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-300 text-white cursor-not-allowed",
                  ].join(" ")}
                >
                  Fetch
                </button>

              </form>

            </div>

            {/* RESUME HISTORY */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm p-6">

              <div className="text-[15px] font-extrabold text-gray-900 mb-4">
                Your Resumes
              </div>

              {loading && (
                <p className="text-sm text-gray-500">
                  Loading resumes...
                </p>
              )}

              {!loading && resumes.length === 0 && (
                <p className="text-sm text-gray-500">
                  No resumes created yet.
                </p>
              )}

              <div className="space-y-3">

                {resumes.map((resume) => (

                  <div
                    key={resume._id}
                    className="flex items-center justify-between border rounded-xl px-4 py-3"
                  >

                    <div>

                      <div className="font-bold text-sm text-blue-700">
                        {resume.cvNumber}
                      </div>

                      <div className="text-sm font-semibold">
                        {resume.templateName || "Template"}
                      </div>

                      <div className="text-xs text-gray-500">
                        Category: {resume.categoryName || "Category"}
                      </div>

                    </div>

                    <div className="flex gap-2">

                      {/* EDIT */}
                      <button
                        onClick={() => navigate(`/stu/builder/${resume.templateId}?cv=${resume.cvNumber}`)}
                        className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-lg"
                      >
                        Edit
                      </button>

                      {/* DOWNLOAD */}
                      {resume.pdfUrl && (
                        <button
                          onClick={() => handleDownload(resume.cvNumber)}
                          className="text-xs font-bold px-3 py-1 bg-green-600 text-white rounded-lg"
                        >
                          Download
                        </button>
                      )}

                      {/* DELETE */}
                      <button
                        onClick={() => deleteResume(resume._id)}
                        className="text-xs font-bold px-3 py-1 bg-red-500 text-white rounded-lg"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* RIGHT PROFILE CARD */}
          <div>

            <div className="w-full rounded-[28px] overflow-hidden shadow-xl border border-gray-200">

              <div className="bg-gradient-to-b from-[#0B1733] to-[#071028] px-6 py-5 text-white">

                <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[13px] font-extrabold">
                  Student Account
                </div>

                <div className="mt-4 flex items-center gap-4">

                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xl font-extrabold">
                    {initial}
                  </div>

                  <div>

                    <div className="text-[16px] font-extrabold">
                      {name}
                    </div>

                    <div className="mt-0.5 text-[13px] text-white/75">
                      {email}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* RECOGNIZED */}
      <div className="w-full flex justify-center mt-2 mb-24 px-4">

        <div className="flex flex-col items-center text-gray-400 text-center">

          <div className="text-[13px] tracking-widest font-semibold mb-1">
            RECOGNIZED BY
          </div>

          <img
            src="/startup-india-dpiit.png"
            alt="Startup India DPIIT"
            className="w-[100px] opacity-90"
          />

        </div>

      </div>

    </section>
  );
}