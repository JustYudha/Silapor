import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tracking from './pages/Tracking';
import Dashboard from './pages/Dashboard';
import PengajuanForm from './pages/PengajuanForm';
import PengaduanForm from './pages/PengaduanForm';
import Riwayat from './pages/Riwayat';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPengajuan from './pages/admin/AdminPengajuan';
import AdminPengaduan from './pages/admin/AdminPengaduan';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pengajuan" element={<ProtectedRoute><PengajuanForm /></ProtectedRoute>} />
        <Route path="/pengaduan" element={<ProtectedRoute><PengaduanForm /></ProtectedRoute>} />
        <Route path="/riwayat" element={<ProtectedRoute><Riwayat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/pengajuan" element={<ProtectedRoute adminOnly><AdminPengajuan /></ProtectedRoute>} />
        <Route path="/admin/pengaduan" element={<ProtectedRoute adminOnly><AdminPengaduan /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
