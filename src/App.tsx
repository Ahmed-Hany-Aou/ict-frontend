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

// Helper to gracefully retry loading chunks on network/deployment updates
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Chunk load failed, retrying page import...', error);
      // If it fails once due to a hot-reload / new chunk hash, retry once
      try {
        return await componentImport();
      } catch (retryError) {
        // As a last resort on chunk load error, reload page to get fresh assets
        window.location.reload();
        throw retryError;
      }
    }
  });

// Lazy load all page components for better performance
const AuthPages = lazyWithRetry(() => import('./AuthPages'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Chapters = lazyWithRetry(() => import('./pages/Chapters'));
const ChapterViewer = lazyWithRetry(() => import('./pages/ChapterViewer'));
const SlideViewer = lazyWithRetry(() => import('./pages/SlideViewer'));
const Quiz = lazyWithRetry(() => import('./pages/Quiz'));
const Quizzes = lazyWithRetry(() => import('./pages/Quizzes'));
const Results = lazyWithRetry(() => import('./pages/Results'));
const QuizResultDetail = lazyWithRetry(() => import('./pages/QuizResultDetail'));
const Progress = lazyWithRetry(() => import('./pages/Progress'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const InstallGuide = lazyWithRetry(() => import('./pages/InstallGuide'));
const About = lazyWithRetry(() => import('./pages/About'));

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
