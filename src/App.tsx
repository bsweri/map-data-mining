import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// import Pricing from './pages/Pricing'; // removed because pricing uses UserDashboard layout
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';

import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageUsers from './pages/admin/ManageUsers';
import ApiMonitoring from './pages/admin/ApiMonitoring';
import PricingSettings from './pages/admin/PricingSettings';
import GlobalSettings from './pages/admin/GlobalSettings';
import Inbox from './pages/admin/Inbox';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/affiliate" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      
      {/* Rute Administrator (Hanya bisa diakses jika role == admin) */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="api" element={<ApiMonitoring />} />
        <Route path="pricing" element={<PricingSettings />} />
        <Route path="messages" element={<Inbox />} />
        <Route path="settings" element={<GlobalSettings />} />
      </Route>
    </Routes>
  );
}
