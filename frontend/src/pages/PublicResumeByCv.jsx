import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function PublicResumeByCv() {
  const { cvNumber } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(`/resumes/cv/${cvNumber}`);
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Resume not found");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [cvNumber]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  if (err)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border rounded-2xl p-6 text-center">
          <div className="text-lg font-extrabold text-gray-900">CV Not Found</div>
          <p className="text-sm text-gray-600 mt-2">{err}</p>
          <div className="mt-4 text-xs text-gray-400">CV: {cvNumber}</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7FBFF] p-6">
      <div className="max-w-4xl mx-auto bg-white border rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Resume Preview</h1>
          <div className="text-xs font-bold text-gray-500">CV: {data.cvNumber}</div>
        </div>

        {/* ✅ Here you render resumeData however your template/view expects */}
        <pre className="mt-4 text-xs bg-gray-50 border rounded-xl p-4 overflow-auto">
          {JSON.stringify(data.resumeData, null, 2)}
        </pre>

        {data.pdfUrl ? (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-bold text-blue-700"
          >
            Open PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}