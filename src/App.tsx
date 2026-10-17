import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { BrowsePage } from '@/pages/BrowsePage';
import { CompanyPage } from '@/pages/CompanyPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { CompanyFormPage } from '@/pages/CompanyFormPage';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/companies/:id" element={<CompanyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/requests/new" element={<NewRequestPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/company/new" element={<CompanyFormPage mode="new" />} />
          <Route path="/dashboard/company/edit" element={<CompanyFormPage mode="edit" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-espresso-100 bg-cream-50 py-6">
        <p className="text-center text-sm text-espresso-400">
          BrokerLink — connecting customers with trusted service providers
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
