import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "👋 Hi! I’m ResumeA Assistant.\nAsk me about templates, pricing, student verification, or downloads.",
    },
  ]);

  const listRef = useRef(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  /* ---------------- LOCK BODY SCROLL ---------------- */
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ---------------- FAQ LOGIC ---------------- */
  const getReply = (q) => {
    const text = q.toLowerCase();

    if (text.includes("template")) {
      return "You can browse resume templates from the Templates section and preview before downloading.";
    }

    if (text.includes("price") || text.includes("pricing")) {
      return "Students pay ₹10 (or FREE with APAAR ID). Professionals pay ₹99/year.";
    }

    if (text.includes("apaar")) {
      return "APAAR ID is a 12-digit academic ID used to verify student status.";
    }

    if (text.includes("download")) {
      return "You can download your resume after completing your builder and selecting a template.";
    }

    if (text.includes("verification") || text.includes("student")) {
      return "Student verification can be done using APAAR ID or transcript upload.";
    }

    if (text.includes("connect") || text.includes("contact") || text.includes("support")) {
      return "You can reach our team at info@povtechnologies.com.";
    }

    return "I can help with resume, templates, pricing, and student verification.\nFor anything else, please reach out to info@povtechnologies.com.";
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: getReply(input) };

    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* ================= CHAT WINDOW ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="
              fixed bottom-20 sm:bottom-24 right-3 sm:right-4 md:right-6 z-50
              w-[94vw] sm:w-[92vw] md:w-[360px]
              max-w-[360px]
              h-[460px] sm:h-[500px] md:h-[560px]
              bg-white rounded-2xl shadow-2xl border
              flex flex-col overflow-hidden
            "
            role="dialog"
            aria-label="Chatbot assistant"
          >
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">
                  RESUMEA Assistant
                </span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ===== QUICK FAQ ===== */}
            <div className="px-3 py-2 border-b flex flex-wrap gap-2 bg-gray-50">
              {[
                "What is APAAR ID?",
                "How does verification work?",
                "Pricing plans?",
                "How to download resume?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    setMessages((m) => [
                      ...m,
                      { from: "user", text: q },
                      { from: "bot", text: getReply(q) },
                    ])
                  }
                  className="text-[11px] sm:text-xs bg-white border px-2 sm:px-3 py-1 rounded-full hover:bg-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* ===== MESSAGES ===== */}
            <div
              ref={listRef}
              className="
                flex-1 min-h-0
                p-3 sm:p-4 text-xs sm:text-sm
                space-y-3
                overflow-y-auto
                text-gray-700
              "
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-2.5 sm:p-3 whitespace-pre-line ${
                    msg.from === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* ===== INPUT ===== */}
            <div className="p-2.5 sm:p-3 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your question..."
                className="
                  flex-1 px-3 sm:px-4 py-2 rounded-lg border
                  text-xs sm:text-sm
                  outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              <button
                onClick={sendMessage}
                className="
                  bg-blue-600 text-white
                  px-3 sm:px-4
                  rounded-lg
                  flex items-center justify-center
                "
              >
                <Send size={16} />
              </button>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="text-[10px] sm:text-[11px] text-gray-400 text-center py-2 border-t">
              For anything else: info@povtechnologies.com
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FLOAT BUTTON ================= */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="
          fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50
          w-12 h-12 sm:w-14 sm:h-14
          rounded-full
          bg-blue-600 text-white
          flex items-center justify-center
          shadow-xl
        "
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />

        <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </motion.button>
    </>
  );
};

export default ChatbotWidget;