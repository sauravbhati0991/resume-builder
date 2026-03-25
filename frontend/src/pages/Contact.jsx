import Footer from "../components/Footer";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about pricing, templates, or need technical support? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Contact Info Side */}
            <div className="bg-blue-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <p className="text-blue-100 mb-10">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Email Us</p>
                      <p className="font-medium">support@resumea.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Call Us</p>
                      <p className="font-medium">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Visit Us</p>
                      <p className="font-medium">Tech Park, Guwahati, Assam</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="p-10">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={4} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="How can we help you?" required></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;