import { createBrowserRouter } from 'react-router';
import { CustomerLayout } from './components/CustomerLayout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { SearchPage } from './pages/Search';
import { FieldDetail } from './pages/FieldDetail';
import { Checkout } from './pages/Checkout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { FieldManagement } from './pages/admin/FieldManagement';
import { OwnerLayout } from './components/OwnerLayout';
import { OwnerDashboard } from './pages/owner/Dashboard';
import { OwnerBookings } from './pages/owner/Bookings';
import { Auth } from './pages/Auth';
import { Contact } from './pages/Contact';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';
import { OwnerRegistration } from './pages/OwnerRegistration';
import { OwnerPaymentSettings } from './pages/owner/PaymentSettings';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/owner/register',
    Component: OwnerRegistration,
  },
  {
    path: '/',
    Component: CustomerLayout,
    children: [
      { index: true, Component: Home },
      { path: 'search', Component: SearchPage },
      { path: 'field/:id', Component: FieldDetail },
      { path: 'checkout', Component: Checkout },
      { path: 'contact', Component: Contact },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'fields', Component: FieldManagement },
      { path: 'bookings', Component: AdminBookings },
      { path: 'users', Component: AdminUsers },
      { path: 'settings', Component: AdminSettings },
    ],
  },
  {
    path: '/owner',
    Component: OwnerLayout,
    children: [
      { index: true, Component: OwnerDashboard },
      { path: 'bookings', Component: OwnerBookings },
      { path: 'fields', Component: FieldManagement },
      { path: 'payment', Component: OwnerPaymentSettings },
    ],
  },
]);
