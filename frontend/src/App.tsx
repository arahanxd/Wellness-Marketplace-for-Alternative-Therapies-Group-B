import { Route, Routes, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DegreeUploadPage } from './pages/DegreeUploadPage'
import { UserDashboard } from './pages/UserDashboard'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { MarketplacePage } from './pages/MarketplacePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { WishlistPage } from './pages/WishlistPage'
import { MyProductsPage } from './pages/MyProductsPage'
import { PractitionerProductManager } from './pages/PractitionerProductManager'
import { ProductOrdersPage } from './pages/ProductOrdersPage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { ForumPage } from './pages/ForumPage'
import { QuestionDetailPage } from './pages/QuestionDetailPage'
import { ProtectedRoute } from './components/ProtectedRoute'

import { VerificationPendingPage } from './pages/VerificationPendingPage'
import { VerifyEmailLanding } from './pages/VerifyEmailLanding'
import { OtpVerificationPage } from './pages/OtpVerificationPage'

function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Verification */}
        <Route path="/verification-sent" element={<VerificationPendingPage />} />
        <Route path="/otp-verification" element={<OtpVerificationPage />} />
        <Route path="/verify" element={<VerifyEmailLanding />} />

        {/* Degree Upload */}
        <Route path="/upload-degree" element={<DegreeUploadPage />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplacePage />} />

        <Route path="/products" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <CartPage />
          </ProtectedRoute>
        } />

        <Route path="/wishlist" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <WishlistPage />
          </ProtectedRoute>
        } />

        <Route path="/product/:productId" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER', 'ADMIN']}>
            <ProductDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/my-products" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <MyProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/my-products/:productId" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <PractitionerProductManager />
          </ProtectedRoute>
        } />

        <Route path="/product-orders" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER']}>
            <ProductOrdersPage />
          </ProtectedRoute>
        } />

        {/* Dashboards */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/practitioner" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <PractitionerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminReportsPage />
          </ProtectedRoute>
        } />

        <Route path="/forum" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER', 'ADMIN']}>
            <ForumPage />
          </ProtectedRoute>
        } />

        <Route path="/forum/:id" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER', 'ADMIN']}>
            <QuestionDetailPage />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App;
