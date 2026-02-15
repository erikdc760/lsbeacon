
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User } from './types';
import Login from './components/Login';
import AdminPortal from './components/admin/AdminPortal';
import OwnerPortal from './components/owner/OwnerPortal';
import AgentPortal from './components/agent/AgentPortal';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  user: User | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    // Redirect to correct portal based on user role
    const roleRoutes: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: '/admin',
      [UserRole.COMPANY_OWNER]: '/company',
      [UserRole.AGENT]: '/agent'
    };
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

// Login Route Component
interface LoginRouteProps {
  user: User | null;
  onLogin: (role: UserRole, email: string) => void;
}

const LoginRoute: React.FC<LoginRouteProps> = ({ user, onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect to appropriate portal based on role
      const roleRoutes: Record<UserRole, string> = {
        [UserRole.SUPER_ADMIN]: '/admin',
        [UserRole.COMPANY_OWNER]: '/company',
        [UserRole.AGENT]: '/agent'
      };
      navigate(roleRoutes[user.role], { replace: true });
    }
  }, [user, navigate]);

  return <Login onLogin={onLogin} />;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: UserRole, email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].toUpperCase().replace('.', ' '),
      role,
      email,
      companyId: role === UserRole.SUPER_ADMIN ? 'BEACON-CORE-SYS' : 'LEGACY-SHIELD-V01',
      avatar: `https://picsum.photos/seed/${email}/200/200`
    };
    setUser(newUser);
    // Store in sessionStorage for persistence
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Restore user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginRoute user={user} onLogin={handleLogin} />} />

        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user} requiredRole={UserRole.SUPER_ADMIN}>
              <AdminPortal user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Company Owner Route */}
        <Route 
          path="/company" 
          element={
            <ProtectedRoute user={user} requiredRole={UserRole.COMPANY_OWNER}>
              <OwnerPortal user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Agent Route */}
        <Route 
          path="/agent" 
          element={
            <ProtectedRoute user={user} requiredRole={UserRole.AGENT}>
              <AgentPortal user={user!} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Root redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
