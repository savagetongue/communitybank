import { useAuthStore } from '@/stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';
export function AdminGuard() {
  const user = useAuthStore(s => s.user);
  if (!user?.isAdmin) {
    // user is not an admin, redirect to dashboard
    return <Navigate to="/dashboard" />;
  }
  return <Outlet />;
}