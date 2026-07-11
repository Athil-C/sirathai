import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LearningPaths from './pages/LearningPaths';
import PathRoadmap from './pages/PathRoadmap';
import Community from './pages/Community';
import Leaderboard from './pages/Leaderboard';
import LessonPlayer from './pages/LessonPlayer';
import Onboarding from './pages/Onboarding';
import MuftiDashboard from './pages/MuftiDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import ReportMufti from './pages/ReportMufti';
import Certificates from './pages/Certificates';


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

// Redirect authenticated users away from landing/login/register
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect to onboarding if not completed
const OnboardingGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && !user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
};

// Mufti/admin-only route
const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Onboarding (no layout nav needed but still in layout for consistency) */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* Protected - Student (with onboarding guard) */}
        <Route path="/dashboard" element={<ProtectedRoute><OnboardingGuard><Dashboard /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/paths" element={<ProtectedRoute><OnboardingGuard><LearningPaths /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/paths/:slug" element={<ProtectedRoute><OnboardingGuard><PathRoadmap /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/paths/:slug/lesson/:lessonId" element={<ProtectedRoute><OnboardingGuard><LessonPlayer /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><OnboardingGuard><Community /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><OnboardingGuard><Leaderboard /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><OnboardingGuard><Profile /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><OnboardingGuard><Certificates /></OnboardingGuard></ProtectedRoute>} />
        <Route path="/report-mufti" element={<ProtectedRoute><OnboardingGuard><ReportMufti /></OnboardingGuard></ProtectedRoute>} />

        {/* Mufti */}
        <Route path="/mufti" element={<RoleRoute roles={['mufti', 'admin']}><MuftiDashboard /></RoleRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
