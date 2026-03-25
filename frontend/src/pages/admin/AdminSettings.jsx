import { Settings, Save } from "lucide-react";

const AdminSettings = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <Settings className="text-gray-400" /> Platform Settings
    </h2>
    
    <div className="space-y-6 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
        <input type="text" defaultValue="ResumeA" className="w-full border rounded-lg p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
        <input type="email" defaultValue="support@resumea.com" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="maintenance" className="w-4 h-4 text-blue-600" />
        <label htmlFor="maintenance" className="text-sm text-gray-700">Enable Maintenance Mode</label>
      </div>

      <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
        <Save size={18} /> Save Settings
      </button>
    </div>
  </div>
);

export default AdminSettings;