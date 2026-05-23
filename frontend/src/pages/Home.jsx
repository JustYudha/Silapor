import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Search, Cloud, Database, Container } from 'lucide-react';
import './Home.css';

const features = [
  {
    icon: FileText,
    title: 'Pengajuan Surat Online',
    desc: 'Ajukan surat domisili, usaha, keterangan, dan lainnya tanpa antri di kantor kelurahan.',
  },
  {
    icon: MessageSquare,
    title: 'Pengaduan Masyarakat',
    desc: 'Laporkan masalah infrastruktur, kebersihan, keamanan dengan foto bukti langsung.',
  },
  {
    icon: Search,
    title: 'Tracking Status Layanan',
    desc: 'Pantau progres pengajuan dan pengaduan secara real-time dengan nomor tracking.',
  },
];

const stack = [
  { icon: Cloud, label: 'AWS S3 + ImageKit CDN' },
  { icon: Database, label: 'MySQL RDS' },
  { icon: Container, label: 'Docker + ECS Fargate' },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">Sistem Pelayanan Publik Cibolerang</div>
          <h1>SiLapor <span>Kopo</span></h1>
          <p className="hero-desc">
            Platform digital kelurahan untuk pengajuan surat, pengaduan masyarakat,
            dan pelacakan layanan — dibangun di atas infrastruktur cloud AWS.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Daftar sebagai Masyarakat</Link>
            <Link to="/tracking" className="btn btn-outline">Cek Status Layanan</Link>
          </div>
          <div className="hero-stack">
            {stack.map((s) => (
              <span key={s.label} className="stack-item">
                <s.icon size={16} /> {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="features container">
        <h2>Fitur Utama</h2>
        <div className="grid-3">
          {features.map((f) => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon"><f.icon size={28} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta container">
        <div className="cta-card card">
          <h2>Mulai Gunakan Layanan Digital</h2>
          <p>Masyarakat dapat mengajukan surat dan pengaduan. Admin Kelurahan mengelola semua permohonan.</p>
          <div className="cta-actions">
            <Link to="/login" className="btn btn-primary">Masuk ke Akun</Link>
            <Link to="/login" className="btn btn-outline">Login Admin Kelurahan</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
