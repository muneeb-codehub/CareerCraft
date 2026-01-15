// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400 text-lg">Loading...</p>
    </div>
  </div>
);

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OnBoardingPage = lazy(() => import('./pages/OnBoardingPage'));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage'));
const SkillGapAnalysisPage = lazy(() => import('./pages/SkillGapAnalysisPage'));
const InterviewSimulatorPage = lazy(() => import('./pages/InterviewSimulatorPage'));
const CareerRoadmapPage = lazy(() => import('./pages/CareerRoadmapPage'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const ProgressTrackerPage = lazy(() => import('./pages/ProgressTrackerPage'));

// Future imports (commented for now)
// import AdminPanel from './pages/AdminPanel';

// 404 Page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Go Home
      </a>
    </div>
  </div>
);

function App() {
  const { initializeAuth, isAuthenticated, token, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth when app loads - restore session if token exists
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while initializing auth
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/signup" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} 
            />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnBoardingPage />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeBuilderPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/skill-gap" 
            element={
              <ProtectedRoute>
                <SkillGapAnalysisPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/interview" 
            element={
              <ProtectedRoute>
                <InterviewSimulatorPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/roadmap" 
            element={
              <ProtectedRoute>
                <CareerRoadmapPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <ProgressTrackerPage />
              </ProtectedRoute>
            } 
          />

          {/* Future Protected Routes - Keep commented for later use */}
          {/* 
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          */}

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      </Suspense>
    </Router>
  );
}

export default App;