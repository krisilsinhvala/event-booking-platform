import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ScrollToTop from './components/common/ScrollToTop';
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminEventFormPage from './pages/AdminEventFormPage';
import AdminBookingDetailsPage from './pages/AdminBookingDetailsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminHomePage from './pages/AdminHomePage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import DashboardHomePage from './pages/DashboardHomePage';
import EventDetailsPage from './pages/EventDetailsBookingPage';
import EventsPage from './pages/EventsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHomePage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminHomePage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/new" element={<AdminEventFormPage />} />
            <Route path="events/:eventId/edit" element={<AdminEventFormPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="bookings/:bookingId" element={<AdminBookingDetailsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
