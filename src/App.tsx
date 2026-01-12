
import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from 'react-helmet-async';
import SEOGuard from '@/components/SEOGuard';

// Улучшенная загрузка с очисткой кэша при ошибке
const lazyWithReload = (componentImport: () => Promise<any>) => 
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Component load failed, reloading page...', error);
      // При ошибке загрузки перезагружаем страницу для сброса кэша
      window.location.reload();
      throw error;
    }
  });

const Index = lazyWithReload(() => import("./pages/Index"));
const NotFoundPage = lazyWithReload(() => import("./pages/NotFoundPage"));
const CatalogPage = lazyWithReload(() => import("./pages/CatalogPage"));
const WorkDetailPage = lazyWithReload(() => import("./pages/WorkDetailPage"));
const LoginPage = lazyWithReload(() => import("./pages/LoginPage"));
const RegisterPage = lazyWithReload(() => import("./pages/RegisterPage"));
const ProfilePage = lazyWithReload(() => import("./pages/ProfilePage"));
const BlogListPage = lazyWithReload(() => import("./pages/BlogListPage"));
const BlogPost = lazyWithReload(() => import("./pages/BlogPost"));

const PrivacyPolicyPage = lazyWithReload(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazyWithReload(() => import("./pages/TermsOfServicePage"));
const UsageRulesPage = lazyWithReload(() => import("./pages/UsageRulesPage"));
const OfferPage = lazyWithReload(() => import("./pages/OfferPage"));
const Requisites = lazyWithReload(() => import("./pages/Requisites"));
const ContactsPage = lazyWithReload(() => import("./pages/ContactsPage"));

const AdminPage = lazyWithReload(() => import("./pages/AdminPage"));
const AdminBlogPage = lazyWithReload(() => import("./pages/AdminBlogPage"));
const SupportAdmin = lazyWithReload(() => import("./components/SupportAdmin"));
const SecurityLogsPage = lazyWithReload(() => import("./pages/SecurityLogsPage"));
const PointsAuditPage = lazyWithReload(() => import("./pages/PointsAuditPage"));
const GenerateReviewsPage = lazyWithReload(() => import("./pages/GenerateReviewsPage"));
const BulkGenerateReviewsPage = lazyWithReload(() => import("./pages/BulkGenerateReviewsPage"));
const AutoGenerateReviewsPage = lazyWithReload(() => import("./pages/AutoGenerateReviewsPage"));
const ReviewsCleanupPage = lazyWithReload(() => import("./pages/ReviewsCleanupPage"));
const SitemapViewPage = lazyWithReload(() => import("./pages/SitemapViewPage"));
const ModerationPage = lazyWithReload(() => import("./pages/ModerationPage"));

const BuyPointsPage = lazyWithReload(() => import("./pages/BuyPointsPage"));
const UploadWorkPage = lazyWithReload(() => import("./pages/UploadWorkPage"));
const EditWorkPage = lazyWithReload(() => import("./pages/EditWorkPage"));
const AuthorMarketplacePage = lazyWithReload(() => import("./pages/AuthorMarketplacePage"));
const SyncPreviewsPage = lazyWithReload(() => import("./pages/SyncPreviewsPage"));
const FullSyncPage = lazyWithReload(() => import("./pages/FullSyncPage"));
const BatchUploadPage = lazyWithReload(() => import("./pages/BatchUploadPage"));
const ExtractPreviews = lazyWithReload(() => import("./pages/ExtractPreviews"));

const ForgotPasswordPage = lazyWithReload(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyWithReload(() => import("./pages/ResetPasswordPage"));
const TestLoginPage = lazyWithReload(() => import("./pages/TestLoginPage"));

const PaymentPage = lazyWithReload(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazyWithReload(() => import("./pages/PaymentSuccessPage"));
const PaymentFailedPage = lazyWithReload(() => import("./pages/PaymentFailedPage"));
const DefenseKitBuilder = lazyWithReload(() => import("./pages/DefenseKitBuilder"));

const YandexVerification = lazyWithReload(() => import("./pages/YandexVerification"));

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



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 10, // 10 минут
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

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
          <Route path="/work/:id/edit" element={<EditWorkPage />} />
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