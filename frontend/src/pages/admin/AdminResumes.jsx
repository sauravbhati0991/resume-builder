import { FileText, Download } from "lucide-react";

const AdminResumes = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <FileText size={32} />
    </div>
    <h2 className="text-xl font-bold text-gray-800">User Resumes</h2>
    <p className="text-gray-500 mt-2 max-w-md mx-auto">
      This module will list all resumes created by users, allowing admins to view, download, or moderate content.
    </p>
    <button className="mt-6 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium disabled cursor-not-allowed">
      Feature Coming Soon
    </button>
  </div>
);

export default AdminResumes;