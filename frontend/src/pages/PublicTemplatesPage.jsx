import { Link } from "react-router-dom";
import { LayoutGrid, Sparkles, Lock } from "lucide-react";

export default function PublicTemplatesPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-white pt-16 pb-24 px-6">
      <div className="max-w-6xl mx-auto text-center">

        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Sparkles size={16} />
          15+ Professional Categories
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Choose From 100+ Resume Templates
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
          Explore beautifully designed, ATS-friendly resume templates across
          15 different career categories.
          Sign up to customize and download your resume instantly.
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <LayoutGrid className="mx-auto mb-4 text-blue-600" size={28} />
            <h3 className="text-2xl font-bold">15+</h3>
            <p className="text-gray-600 mt-2">Career Categories</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <Sparkles className="mx-auto mb-4 text-purple-600" size={28} />
            <h3 className="text-2xl font-bold">100+</h3>
            <p className="text-gray-600 mt-2">Modern Templates</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <Lock className="mx-auto mb-4 text-green-600" size={28} />
            <h3 className="text-2xl font-bold">ATS Ready</h3>
            <p className="text-gray-600 mt-2">Optimized Layouts</p>
          </div>
        </div>

        {/* CTA */}
        <Link to="/register">
          <button className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Sign Up & Start Building
          </button>
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}