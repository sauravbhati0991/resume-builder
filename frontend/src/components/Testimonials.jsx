import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Student",
    text: "Got my dream internship with a resume made on EasyCV. The APAAR ID feature saved me money!",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer",
    text: "The AI suggestions really improved my resume. Worth every rupee!",
  },
  {
    name: "Anjali Patel",
    role: "Recent Graduate",
    text: "Simple, professional, and affordable. Highly recommend!",
  },
];

const Testimonials = () => {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-blue-50 via-white to-cyan-50"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2
            id="testimonials-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-3"
          >
            What Our Users Say
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-black/70">
            Join thousands of satisfied users
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="
                bg-white border border-gray-200 rounded-2xl
                p-5 sm:p-6 lg:p-8
                shadow-sm hover:shadow-xl transition
              "
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4 sm:mb-5 lg:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-xs sm:text-sm lg:text-base text-black/80 mb-6 sm:mb-7 lg:mb-8 leading-relaxed">
                "{item.text}"
              </p>

              {/* User */}
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-black">
                  {item.name}
                </h4>

                <p className="text-xs sm:text-sm text-black/60">
                  {item.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;