import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPages from './AuthPages';
import Dashboard from './pages/Dashboard';
import Chapters from './pages/Chapters';
import ChapterViewer from './pages/ChapterViewer';
import SlideViewer from './pages/SlideViewer';
import Quiz from './pages/Quiz';
import Quizzes from './pages/Quizzes';
import Results from './pages/Results';
import QuizResultDetail from './pages/QuizResultDetail';
import Progress from './pages/Progress';
import Profile from './pages/Profile';


function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
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
        path="/quiz/:quizId"
        element={isAuthenticated ? <Quiz /> : <Navigate to="/auth" />}
      />
      <Route
        path="/chapter/:chapterId/quiz"
        element={isAuthenticated ? <Quiz /> : <Navigate to="/auth" />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;



