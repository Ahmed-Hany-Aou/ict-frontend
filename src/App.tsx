import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PremiumProvider } from './context/PremiumContext';
import { Loader } from 'lucide-react';

// Create React Query client with optimized config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Garbage collect cached data after 10 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 1, // Retry failed requests once
    },
  },
});

// Lazy load all page components for better performance
const AuthPages = lazy(() => import('./AuthPages'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chapters = lazy(() => import('./pages/Chapters'));
const ChapterViewer = lazy(() => import('./pages/ChapterViewer'));
const SlideViewer = lazy(() => import('./pages/SlideViewer'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const Results = lazy(() => import('./pages/Results'));
const QuizResultDetail = lazy(() => import('./pages/QuizResultDetail'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));
const InstallGuide = lazy(() => import('./pages/InstallGuide'));
const About = lazy(() => import('./pages/About'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);


function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
  <Route path="/install" element={<InstallGuide />} />
      <Route path="/auth" element={<AuthPages />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/chapter/:id"
        element={isAuthenticated ? <ChapterViewer /> : <Navigate to="/auth" />}
      />
      <Route
        path="/chapter/:id/slides"
        element={isAuthenticated ? <SlideViewer /> : <Navigate to="/auth" />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
      />
      <Route
        path="/chapters"
        element={isAuthenticated ? <Chapters /> : <Navigate to="/auth" />}
      />
      <Route
        path="/quizzes"
        element={isAuthenticated ? <Quizzes /> : <Navigate to="/auth" />}
      />
      <Route
        path="/results"
        element={isAuthenticated ? <Results /> : <Navigate to="/auth" />}
      />
      <Route
        path="/results/:resultId"
        element={isAuthenticated ? <QuizResultDetail /> : <Navigate to="/auth" />}
      />
      <Route
        path="/progress"
        element={isAuthenticated ? <Progress /> : <Navigate to="/auth" />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
      />
      <Route
        path="/contact"
        element={isAuthenticated ? <Contact /> : <Navigate to="/auth" />}
      />
      <Route
        path="/about"
        element={isAuthenticated ? <About /> : <Navigate to="/auth" />}
      />
      <Route
        path="/quiz/:quizId"
        element={isAuthenticated ? <Quiz /> : <Navigate to="/auth" />}
      />
      <Route
        path="/chapter/:chapterId/quiz"
        element={isAuthenticated ? <Quiz /> : <Navigate to="/auth" />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <PremiumProvider>
            <AppRoutes />
          </PremiumProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
