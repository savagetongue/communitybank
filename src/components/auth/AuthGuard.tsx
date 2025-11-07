import { useAuthStore } from '@/stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';
export function AuthGuard() {
  const token = useAuthStore(s => s.token);
  if (!token) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}