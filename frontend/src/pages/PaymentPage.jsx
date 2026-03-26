import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Smartphone, ShieldCheck, Zap } from 'lucide-react';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { amount, planName } = location.state || { amount: 10, planName: 'Basic' };

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden p-8 md:p-10 border border-white/20 relative">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-8 flex items-center text-slate-400 hover:text-blue-600 transition-all font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Plans
                </button>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-6">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Complete Payment</h1>
                    <p className="text-slate-500 leading-relaxed">
                        Upgrade to <span className="font-bold text-blue-600">{planName}</span> and unlock premium features instantly.
                    </p>
                </div>

                {/* Amount Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 mb-10 text-center shadow-lg shadow-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <span className="text-blue-100/80 font-medium text-sm block mb-1 uppercase tracking-widest">Amount to Pay</span>
                    <div className="flex items-center justify-center">
                        <span className="text-2xl text-blue-200 mr-1 mt-1 font-medium">₹</span>
                        <span className="text-5xl font-black text-white">{amount}</span>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner group transition-all hover:border-blue-200">
                        <img
                            src="/payment-qr.jpg"
                            alt="Payment QR Code"
                            className="w-56 h-auto rounded-xl mix-blend-multiply grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                        />

                        {/* Overlay scan hint on mobile look? Not really needed but adds flair */}
                        <div className="absolute inset-0 border-4 border-white rounded-[2rem] pointer-events-none"></div>
                    </div>

                    <div className="mt-6 flex flex-col items-center">
                        <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                            <span>Scan with any UPI App</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
                            GPay • PhonePe • BHIM • Paytm
                        </p>
                    </div>
                </div>

                {/* Benefits / Trust */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Instant<br />Activation</span>
                    </div>
                    <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">Secure<br />Payment</span>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-slate-400 font-medium tracking-wide">
                    Payment handled by POV TECHNOLOGIES OPC PVT LTD
                </p>
            </div>

            {/* Footer hint */}
            <p className="mt-8 text-slate-400 text-sm font-medium">
                Need help? <a href="/stu/contact" className="underline text-blue-600 hover:text-blue-700 font-bold">Contact Support</a>
            </p>
        </div>
    );
};

export default PaymentPage;
