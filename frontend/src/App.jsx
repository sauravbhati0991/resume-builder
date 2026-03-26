// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

/* PUBLIC */
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OnboardingIntro from "./pages/OnboardingIntro";
import ChatbotWidget from "./components/ChatbotWidget";

/* Onboarding */
import Signup from "./pages/onboarding/Signup";
import CareerStage from "./pages/onboarding/CareerStage";
import StudentStatus from "./pages/onboarding/StudentStatus";
import AcademicPursuit from "./pages/onboarding/AcademicPursuit";
import OnboardingDetails from "./pages/onboarding/OnboardingDetails";
import StudentVerification from "./pages/onboarding/StudentVerification";
import FinalVerification from "./pages/onboarding/FinalVerification";

/* Public Marketing Templates */
import PublicTemplatesPage from "./pages/PublicTemplatesPage";

/* Shared Template Components */
import PricingPlans from "./components/PricingPlans";
import TemplatesPage from "./components/TemplatesPage";
import TemplatesCategoryPage from "./pages/TemplatesCategoryPage";
import BuilderView from "./pages/BuilderView";
import PublicResumeByCv from "./pages/PublicResumeByCv";
import TemplatePreview from "./pages/TemplatePreview";
import ForgotPassword from "./pages/ForgotPassword";

/* Admin */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

/* Gate */
import DashboardGate from "./pages/DashboardGate";

/* Student Area */
import StudentDashboardNavbar from "./pages/student/StudentDashboardNavbar";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentPricing from "./pages/student/StudentPricing";
import StudentPrintCenters from "./pages/student/StudentPrintCenters";
import AboutResumeA from "./pages/student/AboutResumeA";
import StudentContact from "./pages/student/StudentContact";

/* Professional Area */
import ProfessionalDashboardNavbar from "./pages/pro/ProfessionalDashboardNavbar";
import ProDashboard from "./pages/pro/ProDashboard";
import ProPricing from "./pages/pro/ProPricing";
import ProPrintCenters from "./pages/pro/ProPrintCenters";
import AboutResumeAPro from "./pages/pro/AboutResumeAPro";
import ProContact from "./pages/pro/ProContact";

/* Resume Viewer */
import ResumeViewer from "./pages/ResumeViewer";

/* Protected */
import UserProtectedRoute from "./routes/UserProtectedRoute";
import PaymentPage from "./pages/PaymentPage";

/* =======================
   LAYOUTS
======================= */

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ChatbotWidget />
    </>
  );
}

function StudentLayout() {
  return (
    <>
      <StudentDashboardNavbar />
      <Outlet />
    </>
  );
}

function ProLayout() {
  return (
    <>
      <ProfessionalDashboardNavbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/templates" element={<PublicTemplatesPage />} />

          <Route path="/pricing" element={<PricingPlans />} />
          <Route path="/payment" element={<PaymentPage />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/preview/:templateId" element={<TemplatePreview />} />

          {/* Onboarding */}
          <Route path="/onboarding/intro" element={<OnboardingIntro />} />
          <Route path="/onboarding/stage" element={<CareerStage />} />
          <Route path="/onboarding/student" element={<StudentStatus />} />
          <Route path="/onboarding/academic" element={<AcademicPursuit />} />
          <Route path="/onboarding/details" element={<OnboardingDetails />} />
          <Route
            path="/onboarding/verify-student"
            element={<StudentVerification />}
          />
          <Route
            path="/onboarding/verification"
            element={<StudentVerification />}
          />
          <Route
            path="/onboarding/final-verification"
            element={<FinalVerification />}
          />

          <Route path="/dashboard-gate" element={<DashboardGate />} />

          {/* Public CV view */}
          <Route path="/cv/:cvNumber" element={<PublicResumeByCv />} />
        </Route>

        {/* ================= STUDENT ================= */}

        <Route
          element={
            <UserProtectedRoute allowed="student">
              <StudentLayout />
            </UserProtectedRoute>
          }
        >
          <Route path="/stu" element={<StudentDashboard />} />

          <Route path="/stu/templates" element={<TemplatesPage />} />

          <Route
            path="/stu/templates/:slug"
            element={<TemplatesCategoryPage />}
          />

          <Route path="/stu/builder/:templateId" element={<BuilderView />} />

          {/* ⭐ Resume Viewer inside student layout */}
          <Route path="/stu/resume/:cvNumber" element={<ResumeViewer />} />

          <Route path="/stu/pricing" element={<StudentPricing />} />
          <Route path="/stu/payment" element={<PaymentPage />} />

          <Route path="/stu/contact" element={<StudentContact />} />

          <Route path="/stu/about" element={<AboutResumeA />} />

          <Route path="/stu/verification" element={<StudentVerification />} />

          <Route
            path="/stu/final-verification"
            element={<FinalVerification />}
          />

          <Route path="/stu/print-centers" element={<StudentPrintCenters />} />
        </Route>

        {/* ================= PROFESSIONAL ================= */}

        <Route
          element={
            <UserProtectedRoute allowed="professional">
              <ProLayout />
            </UserProtectedRoute>
          }
        >
          <Route path="/pro" element={<ProDashboard />} />

          <Route path="/pro/templates" element={<TemplatesPage />} />

          <Route
            path="/pro/templates/:slug"
            element={<TemplatesCategoryPage />}
          />

          <Route path="/pro/builder/:templateId" element={<BuilderView />} />

          {/* ⭐ Resume Viewer inside pro layout */}
          <Route path="/pro/resume/:cvNumber" element={<ResumeViewer />} />

          <Route path="/pro/pricing" element={<ProPricing />} />
          <Route path="/pro/payment" element={<PaymentPage />} />

          <Route path="/pro/about" element={<AboutResumeAPro />} />

          <Route path="/pro/contact" element={<ProContact />} />

          <Route path="/pro/print-centers" element={<ProPrintCenters />} />
        </Route>

        {/* ================= ADMIN ================= */}

        <Route path="/admin" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard/*"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
