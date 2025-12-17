
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';

const Index = lazy(() => import("./pages/Index"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const WorkDetailPage = lazy(() => import("./pages/WorkDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const UsageRulesPage = lazy(() => import("./pages/UsageRulesPage"));
const OfferPage = lazy(() => import("./pages/OfferPage"));
const Requisites = lazy(() => import("./pages/Requisites"));

const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminBlogPage = lazy(() => import("./pages/AdminBlogPage"));
const SupportAdmin = lazy(() => import("./components/SupportAdmin"));
const SecurityLogsPage = lazy(() => import("./pages/SecurityLogsPage"));
const PointsAuditPage = lazy(() => import("./pages/PointsAuditPage"));
const GenerateReviewsPage = lazy(() => import("./pages/GenerateReviewsPage"));
const BulkGenerateReviewsPage = lazy(() => import("./pages/BulkGenerateReviewsPage"));
const AutoGenerateReviewsPage = lazy(() => import("./pages/AutoGenerateReviewsPage"));
const ReviewsCleanupPage = lazy(() => import("./pages/ReviewsCleanupPage"));
const SitemapViewPage = lazy(() => import("./pages/SitemapViewPage"));
const ModerationPage = lazy(() => import("./pages/ModerationPage"));

const BuyPointsPage = lazy(() => import("./pages/BuyPointsPage"));
const UploadWorkPage = lazy(() => import("./pages/UploadWorkPage"));
const AuthorMarketplacePage = lazy(() => import("./pages/AuthorMarketplacePage"));
const SyncPreviewsPage = lazy(() => import("./pages/SyncPreviewsPage"));
const FullSyncPage = lazy(() => import("./pages/FullSyncPage"));
const BatchUploadPage = lazy(() => import("./pages/BatchUploadPage"));
const ExtractPreviews = lazy(() => import("./pages/ExtractPreviews"));

const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TestLoginPage = lazy(() => import("./pages/TestLoginPage"));

const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("./pages/PaymentFailedPage"));
const DefenseKitBuilder = lazy(() => import("./pages/DefenseKitBuilder"));

const YandexVerification = lazy(() => import("./pages/YandexVerification"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-slate-50/30 to-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      <p className="mt-4 text-gray-600">Загрузка...</p>
    </div>
  </div>
);



const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="techforma-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/usage-rules" element={<UsageRulesPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/requisites" element={<Requisites />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/moderation" element={<ModerationPage />} />
          <Route path="/admin/support" element={<SupportAdmin />} />
          <Route path="/admin/security-logs" element={<SecurityLogsPage />} />
          <Route path="/admin/points-audit" element={<PointsAuditPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/buy-points" element={<BuyPointsPage />} />
          <Route path="/upload" element={<UploadWorkPage />} />
          <Route path="/work/:id" element={<WorkDetailPage />} />
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

          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/defense-kit" element={<DefenseKitBuilder />} />
          <Route path="/admin/generate-reviews" element={<GenerateReviewsPage />} />
          <Route path="/admin/bulk-reviews" element={<BulkGenerateReviewsPage />} />
          <Route path="/admin/auto-reviews" element={<AutoGenerateReviewsPage />} />
          <Route path="/admin/reviews-cleanup" element={<ReviewsCleanupPage />} />
          <Route path="/admin/sitemap" element={<SitemapViewPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/yandex_c7507f203e2091ee.html" element={<YandexVerification />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;