
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import UsageRulesPage from "./pages/UsageRulesPage";
import BlogPost from "./pages/BlogPost";
import BlogPage from "./pages/BlogPage";
import OfferPage from "./pages/OfferPage";
import Requisites from "./pages/Requisites";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import BuyPointsPage from "./pages/BuyPointsPage";
import UploadWorkPage from "./pages/UploadWorkPage";
import WorkDetailPage from "./pages/WorkDetailPage";
import CatalogPage from "./pages/CatalogPage";
import AuthorMarketplacePage from "./pages/AuthorMarketplacePage";
import SyncPreviewsPage from "./pages/SyncPreviewsPage";
import FullSyncPage from "./pages/FullSyncPage";
import BatchUploadPage from "./pages/BatchUploadPage";
import ExtractPreviews from "./pages/ExtractPreviews";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TestLoginPage from "./pages/TestLoginPage";
import SupportAdmin from "./components/SupportAdmin";
import PaymentPage from "./pages/PaymentPage";
import DefenseKitBuilder from "./pages/DefenseKitBuilder";
import SecurityLogsPage from "./pages/SecurityLogsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import TestPaymentPage from "./pages/TestPaymentPage";



const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="techforma-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/usage-rules" element={<UsageRulesPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/requisites" element={<Requisites />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/support" element={<SupportAdmin />} />
          <Route path="/admin/security-logs" element={<SecurityLogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/buy-points" element={<BuyPointsPage />} />
          <Route path="/upload" element={<UploadWorkPage />} />
          <Route path="/work/:id" element={<WorkDetailPage />} />
          <Route path="/work-detail/:workId" element={<WorkDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/marketplace" element={<AuthorMarketplacePage />} />
          <Route path="/sync-previews" element={<SyncPreviewsPage />} />
          <Route path="/full-sync" element={<FullSyncPage />} />
          <Route path="/batch-upload" element={<BatchUploadPage />} />
          <Route path="/extract-previews" element={<ExtractPreviews />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/test-login" element={<TestLoginPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/test-payment" element={<TestPaymentPage />} />
          <Route path="/defense-kit" element={<DefenseKitBuilder />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;