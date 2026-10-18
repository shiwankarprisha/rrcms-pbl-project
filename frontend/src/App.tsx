import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { DemoPersonaBar } from "./components/DemoPersonaBar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CustomerDashboard } from "./pages/customer/CustomerDashboard";
import { NewRepairPage } from "./pages/customer/NewRepairPage";
import { VendorDashboard } from "./pages/vendor/VendorDashboard";
import { TechnicianDashboard } from "./pages/technician/TechnicianDashboard";
import { DeliveryPartnerDashboard } from "./pages/delivery/DeliveryPartnerDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RepairDetailsPage } from "./pages/RepairDetailsPage";
import { UserRole } from "./types";

// Protected Route Wrapper with Role Authorization
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
        Verifying authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 text-center space-y-3">
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Access Restricted</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Your role ({role}) is not authorized to access this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            <DemoPersonaBar />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/new-repair"
                  element={
                    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                      <NewRepairPage />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Routes */}
                <Route
                  path="/vendor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["VENDOR", "ADMIN"]}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Technician Routes */}
                <Route
                  path="/technician/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["TECHNICIAN", "ADMIN"]}>
                      <TechnicianDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Partner Routes */}
                <Route
                  path="/delivery/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["DELIVERY_PARTNER", "ADMIN"]}>
                      <DeliveryPartnerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                {/* Details & Audit Trail */}
                <Route
                  path="/repairs/:id"
                  element={
                    <ProtectedRoute>
                      <RepairDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;