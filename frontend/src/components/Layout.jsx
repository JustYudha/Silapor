import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Building2 } from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user
    ? isAdmin
      ? [
          { to: '/admin', label: 'Dashboard Admin' },
          { to: '/admin/pengajuan', label: 'Pengajuan Surat' },
          { to: '/admin/pengaduan', label: 'Pengaduan' },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/pengajuan', label: 'Ajukan Surat' },
          { to: '/pengaduan', label: 'Buat Pengaduan' },
          { to: '/riwayat', label: 'Riwayat Saya' },
        ]
    : [];

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <Building2 size={32} />
            <div>
              <span className="logo-title">SiLapor Kopo</span>
              <span className="logo-sub">Sistem Pelayanan Publik Cibolerang</span>
            </div>
          </Link>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/tracking" onClick={() => setMenuOpen(false)}>Tracking</Link>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}
            {user ? (
              <button className="btn btn-sm btn-outline nav-logout" onClick={handleLogout}>
                <LogOut size={16} /> Keluar
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline" onClick={() => setMenuOpen(false)}>Masuk</Link>
                <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Daftar</Link>
              </>
            )}
          </nav>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="container">
          <p><strong>SiLapor Kopo</strong> — Sistem Pelayanan Publik Cibolerang</p>
          <p className="footer-sub">Kelurahan Kopo · Cloud Computing Stack: React · Express · MySQL RDS · S3 · ECS Fargate</p>
        </div>
      </footer>
    </div>
  );
}
