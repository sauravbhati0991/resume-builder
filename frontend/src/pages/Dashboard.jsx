import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
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

  const name =
    user?.fullName ||
    user?.name ||
    onboarding?.fullName ||
    "Demo Student";

  const email =
    user?.email ||
    onboarding?.email ||
    "student@resumea.com";

  const initial = (name?.trim()?.[0] || "D").toUpperCase();

  const verMethod = onboarding?.verificationMethod;
  const apaarId = onboarding?.apaarId;
  const transcript = onboarding?.transcriptFileName;

  return (
    <section className="min-h-screen bg-[#F7FBFF]">
      <div className="mx-auto max-w-6xl px-5 py-10">
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
                placeholder="Search CV ID..."
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

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* New Doc */}
            <div
              onClick={() => navigate("/create-resume")}
              className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group"
            >
              <div className="flex h-[280px] flex-col items-center justify-center rounded-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-600 transition">
                  +
                </div>
                <div className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                  Create New Document
                </div>
              </div>
            </div>

            {/* Existing */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
                  CV-2025-55555
                </div>

                <div className="mt-4 h-[200px] rounded-xl border border-gray-100 bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-sky-100" />
                </div>

                <div className="mt-4">
                  <div className="text-[16px] font-extrabold text-gray-900">
                    {name}
                  </div>
                  <div className="mt-1 text-[12px] text-gray-400">
                    Edited: 11/2/2026
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500">
                    <span>
                      Strength:{" "}
                      <span className="font-semibold text-blue-600">Good</span>
                    </span>
                    <span>50%</span>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 w-[50%] rounded-full bg-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Profile */}
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
                    1
                  </div>
                  <div className="text-[11px] tracking-widest text-gray-400">
                    CVS
                  </div>
                </div>
                <div className="px-6 py-5 text-center">
                  <div className="text-[20px] font-extrabold text-gray-900">
                    0
                  </div>
                  <div className="text-[11px] tracking-widest text-gray-400">
                    COVER LETTERS
                  </div>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="text-[16px] font-extrabold text-gray-900">
                Verification
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div>
                  APAAR: {apaarId ? "Verified" : "Not provided"}
                </div>
                <div>
                  Transcript: {transcript ? "Uploaded" : "Not uploaded"}
                </div>
                <div>
                  Method: {verMethod || "Skipped"}
                </div>
              </div>
            </div>

            {/* Toast */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-4 text-[13px] text-gray-700">
              ✅ Login successful!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}