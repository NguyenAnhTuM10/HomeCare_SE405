import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { RequireAuth } from './auth/RequireAuth';
import { PortalLoading } from './auth/PortalLoading';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

// Screens ported 1:1 from legacy/web/src (docs/frontend-migration.md). Loaded the same way as in the
// prototype: the customer shell + dashboard after sign-in (RootShell), each other screen on demand
// (FeatureLoader). This also keeps the prototype's stylesheet order, which the colours depend on.
const CustomerLayout = lazy(() =>
  import('./layouts/CustomerLayout').then((m) => ({ default: m.CustomerLayout })),
);
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const CleaningPage = lazy(() => import('./features/cleaning/CleaningPage'));
const RepairPage = lazy(() => import('./features/repair/RepairPage'));
const AppliancePage = lazy(() => import('./features/appliance/AppliancePage'));
const BookingPage = lazy(() => import('./features/booking/BookingPage'));
const TrackingPage = lazy(() => import('./features/tracking/TrackingPage'));
const PaymentPage = lazy(() => import('./features/payment/PaymentPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const TechnicianPage = lazy(() => import('./features/technician/TechnicianPage'));

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth roles={['CUSTOMER']}>
            <Suspense fallback={<PortalLoading />}>
              <CustomerLayout />
            </Suspense>
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="cleaning/*" element={<CleaningPage />} />
        <Route path="repair/*" element={<RepairPage />} />
        <Route path="appliance/*" element={<AppliancePage />} />
        <Route path="booking/*" element={<BookingPage />} />
        <Route path="tracking/*" element={<TrackingPage />} />
        <Route path="payment/*" element={<PaymentPage />} />
        <Route path="profile/*" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/technician/*"
        element={
          <RequireAuth roles={['TECHNICIAN']}>
            <Suspense fallback={<PortalLoading />}>
              <TechnicianPage />
            </Suspense>
          </RequireAuth>
        }
      />

      {/* New in the MVP (no prototype screen): operations console for admins */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={['ADMIN']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
}
