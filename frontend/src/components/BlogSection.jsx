import { useEffect, useState } from "react";
import api from "../utils/api"; // baseURL should be http://localhost:5050/api

export default function BlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/blogs")
      .then((res) => setBlogs(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="py-10 sm:py-12 text-center text-gray-500 text-sm sm:text-base">
        Loading blogs...
      </div>
    );

  if (!blogs.length) return null;

  return (
    <section className="py-10 sm:py-12 lg:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Latest Blogs
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Tips, guides, and updates from ResumeA
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {blogs.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="h-36 sm:h-40 md:h-44 bg-gray-100">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 sm:p-5">
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base line-clamp-2">
                  {b.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-3">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}