import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { VerifyNoticePage } from "./pages/VerifyNoticePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BooksPage } from "./pages/BooksPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SessionsPage } from "./pages/SessionsPage";
import { SessionFormPage } from "./pages/SessionFormPage";
import { ClubsPage } from "./pages/ClubsPage";
import { AdminPage } from "./pages/AdminPage";
import { UsersPage } from "./pages/UsersPage";
import { DashboardLayout } from "./components/DashboardLayout";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-notice" element={<VerifyNoticePage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/new" element={<SessionFormPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
      </Route>

      <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
