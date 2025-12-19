
import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import SEOGuard from '@/components/SEOGuard';

// Retry helper for lazy imports with proper error handling
const lazyRetry = (componentImport: () => Promise<any>, retries = 3) => 
  lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retries - 1) {
          console.error('Failed to load component after retries:', error);
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    // Fallback return (TypeScript требует)
    return await componentImport();
  });

const Index = lazyRetry(() => import("./pages/Index"));
const NotFoundPage = lazyRetry(() => import("./pages/NotFoundPage"));
const CatalogPage = lazyRetry(() => import("./pages/CatalogPage"));
const WorkDetailPage = lazyRetry(() => import("./pages/WorkDetailPage"));
const LoginPage = lazyRetry(() => import("./pages/LoginPage"));
const RegisterPage = lazyRetry(() => import("./pages/RegisterPage"));
const ProfilePage = lazyRetry(() => import("./pages/ProfilePage"));
const BlogListPage = lazyRetry(() => import("./pages/BlogListPage"));
const BlogPost = lazyRetry(() => import("./pages/BlogPost"));

const PrivacyPolicyPage = lazyRetry(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazyRetry(() => import("./pages/TermsOfServicePage"));
const UsageRulesPage = lazyRetry(() => import("./pages/UsageRulesPage"));
const OfferPage = lazyRetry(() => import("./pages/OfferPage"));
const Requisites = lazyRetry(() => import("./pages/Requisites"));
const ContactsPage = lazyRetry(() => import("./pages/ContactsPage"));

const AdminPage = lazyRetry(() => import("./pages/AdminPage"));
const AdminBlogPage = lazyRetry(() => import("./pages/AdminBlogPage"));
const SupportAdmin = lazyRetry(() => import("./components/SupportAdmin"));
const SecurityLogsPage = lazyRetry(() => import("./pages/SecurityLogsPage"));
const PointsAuditPage = lazyRetry(() => import("./pages/PointsAuditPage"));
const GenerateReviewsPage = lazyRetry(() => import("./pages/GenerateReviewsPage"));
const BulkGenerateReviewsPage = lazyRetry(() => import("./pages/BulkGenerateReviewsPage"));
const AutoGenerateReviewsPage = lazyRetry(() => import("./pages/AutoGenerateReviewsPage"));
const ReviewsCleanupPage = lazyRetry(() => import("./pages/ReviewsCleanupPage"));
const SitemapViewPage = lazyRetry(() => import("./pages/SitemapViewPage"));
const ModerationPage = lazyRetry(() => import("./pages/ModerationPage"));

const BuyPointsPage = lazyRetry(() => import("./pages/BuyPointsPage"));
const UploadWorkPage = lazyRetry(() => import("./pages/UploadWorkPage"));
const AuthorMarketplacePage = lazyRetry(() => import("./pages/AuthorMarketplacePage"));
const SyncPreviewsPage = lazyRetry(() => import("./pages/SyncPreviewsPage"));
const FullSyncPage = lazyRetry(() => import("./pages/FullSyncPage"));
const BatchUploadPage = lazyRetry(() => import("./pages/BatchUploadPage"));
const ExtractPreviews = lazyRetry(() => import("./pages/ExtractPreviews"));

const ForgotPasswordPage = lazyRetry(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyRetry(() => import("./pages/ResetPasswordPage"));
const TestLoginPage = lazyRetry(() => import("./pages/TestLoginPage"));

const PaymentPage = lazyRetry(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazyRetry(() => import("./pages/PaymentSuccessPage"));
const PaymentFailedPage = lazyRetry(() => import("./pages/PaymentFailedPage"));
const DefenseKitBuilder = lazyRetry(() => import("./pages/DefenseKitBuilder"));

const YandexVerification = lazyRetry(() => import("./pages/YandexVerification"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-slate-50/30 to-white">
    <div className="text-center space-y-4">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-gray-800">Загрузка страницы</p>
        <p className="text-sm text-gray-500">Пожалуйста, подождите...</p>
      </div>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Ошибка загрузки</h1>
            <p className="text-muted-foreground mb-6">
              Не удалось загрузить страницу. Попробуйте обновить.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="techforma-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SEOGuard />
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/usage-rules" element={<UsageRulesPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/requisites" element={<Requisites />} />
          <Route path="/contacts" element={<ContactsPage />} />
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
          </ErrorBoundary>
          </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;