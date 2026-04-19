import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/CreateProposal';
import ProposalDetail from './pages/ProposalDetail';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateProposal />
                </PrivateRoute>
              }
            />
            <Route
              path="/proposal/:id"
              element={
                <PrivateRoute>
                  <ProposalDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

