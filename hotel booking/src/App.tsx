import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { HotelDetails } from './pages/HotelDetails';
import { Booking } from './pages/Booking';
import { Dashboard } from './pages/Dashboard';
import { OwnerPortal } from './pages/OwnerPortal';
import { StaffPortal } from './pages/StaffPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Auth } from './pages/Auth';
import { BecomePartner } from './pages/BecomePartner';
import { SupportPage } from './pages/SupportPage';
import { Invoice } from './pages/Invoice';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { ToastProvider } from './components/common/Toast';
import { CommandSearch } from './components/common/CommandSearch';

// Helper component inside BrowserRouter to sync URL changes to the AppContext role
const RouteSynchronizer: React.FC = () => {
  const location = useLocation();
  const { setCurrentRole } = useApp();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRole('admin');
    } else if (path.startsWith('/partner') || path.startsWith('/owner')) {
      setCurrentRole('owner');
    } else {
      setCurrentRole('guest');
    }
  }, [location.pathname, setCurrentRole]);

  return null;
};

// Route Guards to protect sensitive dashboards & operation desks individually
const GuestProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const PartnerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated || currentUser?.role !== 'PARTNER') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const StaffProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated || currentUser?.role !== 'STAFF') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

// Workspace redirect hub
const WorkspaceRedirect: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser.role === 'PARTNER') {
    return <Navigate to="/partner" replace />;
  }
  if (currentUser.role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Loading Screen Overlay */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Header Navigation */}
      <Navbar />

      {/* Synchronize URL paths with context role */}
      <RouteSynchronizer />

      {/* Main View Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/destinations" element={<Navigate to="/#destinations" replace />} />
          <Route path="/deals" element={<Navigate to="/#deals" replace />} />
          
          {/* Booking flow */}
          <Route path="/booking/:hotelId/:roomId" element={
            <GuestProtectedRoute>
              <Booking />
            </GuestProtectedRoute>
          } />

          {/* Guest Dashboard */}
          <Route path="/dashboard" element={
            <GuestProtectedRoute>
              <Dashboard />
            </GuestProtectedRoute>
          } />

          <Route path="/invoice/:invoiceId" element={
            <GuestProtectedRoute>
              <Invoice />
            </GuestProtectedRoute>
          } />
          
          {/* Partner/Owner Portal */}
          <Route path="/partner" element={
            <PartnerProtectedRoute>
              <OwnerPortal />
            </PartnerProtectedRoute>
          } />
          <Route path="/partner/dashboard" element={<Navigate to="/partner" replace />} />
          <Route path="/partner/login" element={<Navigate to="/login" replace />} />
          
          {/* Legacy route fallback redirect */}
          <Route path="/owner" element={<Navigate to="/partner" replace />} />
          
          {/* Staff Portal */}
          <Route path="/staff" element={
            <StaffProtectedRoute>
              <StaffPortal />
            </StaffProtectedRoute>
          } />
          <Route path="/staff/dashboard" element={<Navigate to="/staff" replace />} />
          <Route path="/staff/login" element={<Navigate to="/login" replace />} />
          
          {/* Admin Portal */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminPortal />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Become Partner Onboarding Flow */}
          <Route path="/become-partner" element={<BecomePartner />} />

          {/* Support Page */}
          <Route path="/support" element={<SupportPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* Workspace redirect hub */}
          <Route path="/workspace" element={<WorkspaceRedirect />} />

          {/* Default fallback redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
          <CommandSearch />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
