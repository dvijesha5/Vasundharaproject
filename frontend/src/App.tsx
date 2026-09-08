import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Expenses } from './pages/Expenses';
import { Products } from './pages/Products';
import { Customers } from './pages/Customers';
import { Transactions } from './pages/Transactions';
import { Upload } from './pages/Upload';
import { Insights } from './pages/Insights';
import { LoginAudit } from './pages/LoginAudit';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Landing } from './pages/Landing';
import { HowItWorks } from './pages/HowItWorks';
import { Features } from './pages/Features';
import { FAQs } from './pages/FAQs';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Authenticating session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="main-content">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="page-wrapper" style={{ minWidth: 0, flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/audit" element={<LoginAudit />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BusinessProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </BusinessProvider>
    </AuthProvider>
  );
};

export default App;
