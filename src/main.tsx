import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { OffersPage } from '@/pages/OffersPage';
import { OfferDetailsPage } from '@/pages/OfferDetailsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminPage } from './pages/AdminPage';
import { AdminGuard } from './components/auth/AdminGuard';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/offers",
    element: <OffersPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/offers/:id",
    element: <OfferDetailsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        element: <AdminGuard />,
        children: [
          {
            path: "/admin",
            element: <AdminPage />,
            errorElement: <RouteErrorBoundary />,
          }
        ]
      }
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)