import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { BrandedLoader } from './components/BrandedLoader';
import ScrollToTop from './components/ScrollToTop';
import LightRays from './components/LightRays';
import { ChatbotWidget } from './components/ChatbotWidget';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const InspectorDashboard = lazy(() => import('./pages/InspectorDashboard').then(m => ({ default: m.InspectorDashboard })));
const NewInspection = lazy(() => import('./pages/NewInspection').then(m => ({ default: m.NewInspection })));
const ComplianceResult = lazy(() => import('./pages/ComplianceResult').then(m => ({ default: m.ComplianceResult })));
const InspectionHistory = lazy(() => import('./pages/InspectionHistory').then(m => ({ default: m.InspectionHistory })));
const ViolationDetails = lazy(() => import('./pages/ViolationDetails').then(m => ({ default: m.ViolationDetails })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ReportPreview = lazy(() => import('./pages/ReportPreview').then(m => ({ default: m.ReportPreview })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const RulesPage = lazy(() => import('./pages/RulesPage').then(m => ({ default: m.RulesPage })));
const LegalFramework = lazy(() => import('./pages/LegalFramework').then(m => ({ default: m.LegalFramework })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const EvidenceReview = lazy(() => import('./pages/EvidenceReview').then(m => ({ default: m.EvidenceReview })));
const InspectionDetail = lazy(() => import('./pages/InspectionDetail').then(m => ({ default: m.InspectionDetail })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage').then(m => ({ default: m.AiAssistantPage })));

import { useScrollReveal } from './hooks/useScrollReveal';

function ScrollRevealWrapper() {
  useScrollReveal();
  return null;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <ScrollRevealWrapper />
          <ScrollToTop />
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
            {typeof window !== 'undefined' && (
              <LightRays
                raysOrigin="top-center"
                raysColor="#6366F1"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
              />
            )}
          </div>
          <Suspense fallback={<BrandedLoader fullScreen={true} message="LegalMetrix AI" subMessage="Loading application modules..." />}>
            <div style={{ position: 'relative', zIndex: 1, width: '100%', minHeight: '100vh' }}>
              <Routes>
                {/* Public Landing Pages */}
                <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>

              {/* Authentication Routes */}
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Internal Application Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Direct Application Paths */}
                <Route path="/dashboard" element={<InspectorDashboard />} />
                <Route path="/new-inspection" element={<NewInspection />} />
                <Route path="/inspections" element={<InspectionHistory />} />
                <Route path="/inspections/:id" element={<InspectionDetail />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportPreview />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/legal-framework" element={<LegalFramework />} />
                <Route path="/evidence/:id" element={<EvidenceReview />} />
                <Route path="/evidence-review" element={<EvidenceReview />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/dashboard/assistant" element={<AiAssistantPage />} />

                {/* Sub-routes under /dashboard for full backwards compatibility */}
                <Route path="/dashboard/inspect" element={<NewInspection />} />
                <Route path="/dashboard/result" element={<ComplianceResult />} />
                <Route path="/dashboard/history" element={<InspectionHistory />} />
                <Route path="/dashboard/history/:id" element={<InspectionDetail />} />
                <Route path="/dashboard/violation" element={<ViolationDetails />} />
                <Route path="/dashboard/products" element={<ProductsPage />} />
                <Route path="/dashboard/products/:id" element={<ProductDetail />} />
                <Route path="/dashboard/reports" element={<ReportsPage />} />
                <Route path="/dashboard/reports/:id" element={<ReportPreview />} />
                <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
                <Route path="/dashboard/rules" element={<RulesPage />} />
                <Route path="/dashboard/legal-framework" element={<LegalFramework />} />
                <Route path="/dashboard/evidence/:id" element={<EvidenceReview />} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
                <Route path="/dashboard/profile" element={<ProfilePage />} />
              </Route>

                {/* Catch-all fallback redirects to / */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Suspense>
          <ChatbotWidget />
        </Router>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
