import { useAuthStore } from '@/stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';
export function AuthGuard() {
  const user = useAuthStore(s => s.user);
  if (!user) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return <Outlet />;
}