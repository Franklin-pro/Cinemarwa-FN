import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import Footer from "./components/Footer"
import MovieContent from "./components/MovieContent"
import UserHomepage from "./components/UserHomepage"
import Navbar from "./components/Navbar"
import ScrollTop from "./components/ScrollTop"
import { MovieProvider } from "./context/MovieProvider";

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import Profile from './pages/Profile';
import MovieDetailsPage from './pages/MovieDetailsPages';
import MovieWatch from './pages/MovieWatch';
import FilmmakerDashboard from './pages/dashboard/FilmmakerDashboard';
import UploadMovie from './pages/dashboard/UploadMovie';
import ViewDashboard from './pages/dashboard/ViewDashboard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import EditMovie from './pages/EditMovie';
import MovieAnalytics from './pages/MovieAnalytics';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentMethodSetup from './pages/filmmaker/PaymentMethodSetup';
import WithdrawalRequest from './pages/filmmaker/WithdrawalRequest';
import WithdrawalHistory from './pages/filmmaker/WithdrawalHistory';

// Home component that routes based on auth status
function HomePage() {
  const { token } = useSelector((state) => state.auth);
  return token ? <UserHomepage /> : <MovieContent />;
}

// Dashboard router based on user role
function DashboardRouter() {
  const { user, token } = useSelector((state) => state.auth);

  // Not authenticated - redirect to login
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Route based on role
  switch (user.role) {
    case 'filmmaker':
      return <FilmmakerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'viewer':
    default:
      return <ViewDashboard />;
  }
}

// Wrapper component to use hooks within Router context
function AppContent() {
  const location = useLocation();

  // Determine if navbar should be hidden based on route
  const isDashboardRoute = location.pathname.startsWith('/dashboard') ||
                           location.pathname.startsWith('/filmmaker') ||
                           location.pathname.startsWith('/admin');

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />

          {/* Smart Dashboard - Routes to appropriate dashboard based on user role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/viewer"
            element={
              <ProtectedRoute>
                <ViewDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:id"
            element={
              <ProtectedRoute>
                <MovieWatch />
              </ProtectedRoute>
            }
          />

          {/* Viewer Dashboard */}
          <Route
            path="/dashboard/viewer"
            element={
              <ProtectedRoute requiredRole="viewer">
                <ViewDashboard />
              </ProtectedRoute>
            }
          />

          {/* Filmmaker Routes */}
          <Route
            path="/dashboard/filmmaker"
            element={
              <ProtectedRoute requiredRole="filmmaker">
                <FilmmakerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/filmmaker/upload"
            element={
              <ProtectedRoute requiredRole="filmmaker">
                <UploadMovie />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/movies/:id/edit"
            element={
              <ProtectedRoute>
                <EditMovie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies/:id/analytics"
            element={
              <ProtectedRoute>
                <MovieAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Payment Routes */}
          <Route
            path="/payment/:movieId"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success/:transactionId"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Filmmaker Financial Routes */}
          <Route
            path="/filmmaker/payment-method"
            element={
              <ProtectedRoute requiredRole="filmmaker">
                <PaymentMethodSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filmmaker/withdrawal-request"
            element={
              <ProtectedRoute requiredRole="filmmaker">
                <WithdrawalRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filmmaker/withdrawal-history"
            element={
              <ProtectedRoute requiredRole="filmmaker">
                <WithdrawalHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ScrollTop />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <MovieProvider>
        <Router>
          <div className="min-h-screen">
            <AppContent />
          </div>
        </Router>
      </MovieProvider>
    </Provider>
  )
}

export default App
