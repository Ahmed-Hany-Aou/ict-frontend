import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPages from './AuthPages';
import Dashboard from './pages/Dashboard';
import ChapterViewer from './pages/ChapterViewer';


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



