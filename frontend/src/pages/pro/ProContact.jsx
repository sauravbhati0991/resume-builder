import { Mail, HelpCircle } from "lucide-react";

export default function ProContact() {
  return (
    <section className="min-h-screen bg-[#F7FBFF] flex flex-col">

      <div className="mx-auto w-full max-w-5xl px-5 py-14 flex-1">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] font-extrabold text-gray-900">
            Contact Support
          </h1>

          <p className="mt-2 text-[14px] text-gray-600 max-w-xl mx-auto">
            For professional account queries, resume assistance, or
            any platform related questions, please contact our support team.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-xl mx-auto">

          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="text-blue-600 w-6 h-6" />
            <h2 className="font-bold text-lg text-gray-900">
              Professional Support
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            If you encounter any issues while creating, editing, or
            downloading your resume, please contact our team and we
            will assist you as quickly as possible.
          </p>

          {/* Email Box */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">

            <Mail className="text-blue-600 w-5 h-5" />

            <div>
              <p className="text-xs text-gray-500">
                Contact us via email
              </p>

              <a
                href="mailto:info@povtechnologies.com"
                className="text-blue-700 font-semibold text-sm"
              >
                info@povtechnologies.com
              </a>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}