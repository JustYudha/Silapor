import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, MessageSquare, History, Upload } from 'lucide-react';

const cards = [
  { to: '/pengajuan', icon: FileText, title: 'Ajukan Surat', desc: 'Pengajuan surat online dengan upload dokumen PDF' },
  { to: '/pengaduan', icon: MessageSquare, title: 'Buat Pengaduan', desc: 'Laporkan masalah dengan foto bukti ke S3 & CDN' },
  { to: '/riwayat', icon: History, title: 'Riwayat Saya', desc: 'Lihat semua pengajuan dan pengaduan Anda' },
  { to: '/tracking', icon: Upload, title: 'Tracking', desc: 'Cek status dengan nomor tracking' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Selamat datang, {user?.nama}!</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Dashboard Masyarakat — Kelurahan Kopo</p>
      <div className="grid-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card" style={{ display: 'block', transition: 'transform 0.2s' }}>
            <c.icon size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3>{c.title}</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
