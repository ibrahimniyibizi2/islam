import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import ContactSupport from "./pages/ContactSupport";
import CookiePolicy from "./pages/CookiePolicy";
import FAQs from "./pages/FAQs";
import HajjUmrahApplication from "./pages/HajjUmrahApplication";
import Leadership from "./pages/Leadership";
import NikahApplication from "./pages/NikahApplication";
import TalaqApplication from "./pages/TalaqApplication";
import MarriageCounselingApplication from "./pages/MarriageCounselingApplication";
import OurMission from "./pages/OurMission";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SearchResults from "./pages/SearchResults";
import ShahadaApplication from "./pages/ShahadaApplication";
import TermsOfService from "./pages/TermsOfService";
import UserGuides from "./pages/UserGuides";
import VerifyCertificate from "./pages/VerifyCertificate";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import MasjidAdminDashboard from "./pages/dashboards/MasjidAdminDashboard";
import ImamDashboard from "./pages/dashboards/ImamDashboard";
import MuftiDashboard from "./pages/dashboards/MuftiDashboard";
import FuneralServiceDashboard from "./pages/dashboards/FuneralServiceDashboard";
import NgoManagerDashboard from "./pages/dashboards/NgoManagerDashboard";
import GovernmentLiaisonDashboard from "./pages/dashboards/GovernmentLiaisonDashboard";
import EventManagerDashboard from "./pages/dashboards/EventManagerDashboard";
import BoardMemberDashboard from "./pages/dashboards/BoardMemberDashboard";
import GeneralStaffDashboard from "./pages/dashboards/GeneralStaffDashboard";
import PublicUserDashboard from "./pages/dashboards/PublicUserDashboard";
import TrackApplication from "./pages/TrackApplication";
import TestNotificationsPage from "./pages/dashboards/TestNotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-support" element={<ContactSupport />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/hajj-umrah-application" element={<HajjUmrahApplication />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/nikah-application" element={<NikahApplication />} />
            <Route path="/talaq-application" element={<TalaqApplication />} />
            <Route path="/marriage-counseling-application" element={<MarriageCounselingApplication />} />
            <Route path="/our-mission" element={<OurMission />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/shahada-application" element={<ShahadaApplication />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/user-guides" element={<UserGuides />} />
            <Route path="/verify-certificate/:certificate_number?" element={<VerifyCertificate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />

            <Route path="/dashboard/super-admin/*" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/masjid-admin/*" element={<ProtectedRoute allowedRoles={['masjid_admin']}><MasjidAdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/imam/*" element={<ProtectedRoute allowedRoles={['imam']}><ImamDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/mufti/*" element={<ProtectedRoute allowedRoles={['mufti']}><MuftiDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/funeral-service/*" element={<ProtectedRoute allowedRoles={['funeral_service']}><FuneralServiceDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/ngo-manager/*" element={<ProtectedRoute allowedRoles={['ngo_manager']}><NgoManagerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/government-liaison/*" element={<ProtectedRoute allowedRoles={['government_liaison']}><GovernmentLiaisonDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/event-manager/*" element={<ProtectedRoute allowedRoles={['event_manager']}><EventManagerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/board-member/*" element={<ProtectedRoute allowedRoles={['board_member']}><BoardMemberDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/general-staff/*" element={<ProtectedRoute allowedRoles={['general_staff']}><GeneralStaffDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/user/*" element={<ProtectedRoute allowedRoles={['public_user']}><PublicUserDashboard /></ProtectedRoute>} />
            <Route path="/test-notifications" element={<TestNotificationsPage />} />
            <Route path="/track/:applicationId" element={<TrackApplication />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
