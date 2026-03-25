import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import r1 from "../assets/resumes/resume1.png";
import r2 from "../assets/resumes/resume2.png";
import r3 from "../assets/resumes/resume3.png";
import r4 from "../assets/resumes/resume4.png";
import r5 from "../assets/resumes/resume5.png";

const resumes = [r1, r2, r3, r4, r5];

const ResumeCarousel = () => {
  const [active, setActive] = useState(0);

  // 🔁 AUTO MOVE
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % resumes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => {
    setActive((prev) => (prev === 0 ? resumes.length - 1 : prev - 1));
  };

  const next = () => {
    setActive((prev) => (prev + 1) % resumes.length);
  };

  return (
    <div className="relative h-[380px] sm:h-[420px] md:h-[480px] lg:h-[520px] w-full flex items-center justify-center">

      {/* LEFT ARROW */}
      <button
        onClick={prev}
        className="absolute left-0 sm:left-2 md:left-4 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* STACK (ONLY 3) */}
      <div className="relative w-[260px] sm:w-[300px] md:w-[360px] lg:w-[420px] h-full flex items-center justify-center">
        {resumes.map((src, i) => {
          const offset =
            (i - active + resumes.length) % resumes.length;

          // Only show prev, current, next
          if (offset !== 0 && offset !== 1 && offset !== resumes.length - 1) {
            return null;
          }

          const position =
            offset === 0 ? 0 : offset === 1 ? 1 : -1;

          return (
            <img
              key={i}
              src={src}
              alt={`resume-${i}`}
              className="absolute rounded-2xl shadow-xl bg-white transition-all duration-700 ease-in-out object-cover"
              style={{
                width: window.innerWidth < 640 ? "200px" : window.innerWidth < 1024 ? "260px" : "300px",
                height: window.innerWidth < 640 ? "300px" : window.innerWidth < 1024 ? "380px" : "440px",
                transform: `
                  translateX(${position * (window.innerWidth < 640 ? 60 : 90)}px)
                  scale(${position === 0 ? 1 : 0.9})
                `,
                opacity: 1,
                zIndex: position === 0 ? 20 : 10,
              }}
            />
          );
        })}
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={next}
        className="absolute right-0 sm:right-2 md:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-md flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default ResumeCarousel;