import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChecklistPage from './pages/ChecklistPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import SummaryReportPage from './pages/SummaryReportPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import OfflineIndicator from './components/OfflineIndicator';

// A wrapper to protect routes that require authentication
import type { ReactElement } from 'react';
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user } = useUser();
  // When the user first loads, the state is { name: '', role: null }
  // After login, name will be set and/or role will be 'Officeboy' or 'Supervisor'
  // After logout, the state goes back to { name: '', role: null }
  
  // Only show loading if role is null AND name is empty
  // If either name has a value OR role is not null, then user is either logged in or out
  const isCheckingAuth = user.role === null && user.name === '';
  
  if (isCheckingAuth) {
    // Still loading user data
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return user.role ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <OfflineIndicator />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
          />
          <Route 
            path="/checklist/:type" 
            element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} 
          />
          <Route 
            path="/history" 
            element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} 
          />
          <Route 
            path="/history/:id" 
            element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} 
          />
          <Route 
            path="/summary" 
            element={<ProtectedRoute><SummaryReportPage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} 
          />
        </Routes>
      </div>
    </Router>
  );
};

// The main App component wraps everything in the UserProvider
const App = () => (
  <UserProvider>
    <AppRoutes />
  </UserProvider>
);

export default App;