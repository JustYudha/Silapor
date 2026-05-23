import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { FileText, MessageSquare, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/tracking/stats/overview').then((res) => setStats(res.data.data));
  }, []);

  const countByStatus = (arr, status) => arr?.find((s) => s.status === status)?.total || 0;

  return (
    <div className="container">
      <h1>Dashboard Admin Kelurahan</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Kelola pengajuan surat dan pengaduan masyarakat</p>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Users size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <h3>{stats?.total_masyarakat ?? '-'}</h3>
          <p style={{ color: 'var(--gray-500)' }}>Masyarakat Terdaftar</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FileText size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <h3>{stats?.pengajuan_surat?.reduce((a, b) => a + b.total, 0) ?? '-'}</h3>
          <p style={{ color: 'var(--gray-500)' }}>Total Pengajuan Surat</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <MessageSquare size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <h3>{stats?.pengaduan?.reduce((a, b) => a + b.total, 0) ?? '-'}</h3>
          <p style={{ color: 'var(--gray-500)' }}>Total Pengaduan</p>
        </div>
      </div>

      {stats && (
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3>Pengajuan per Status</h3>
            <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
              {['diajukan', 'diproses', 'selesai', 'ditolak'].map((s) => (
                <li key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s}</span>
                  <strong>{countByStatus(stats.pengajuan_surat, s)}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>Pengaduan per Status</h3>
            <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
              {['diajukan', 'diproses', 'selesai', 'ditolak'].map((s) => (
                <li key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s}</span>
                  <strong>{countByStatus(stats.pengaduan, s)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid-2">
        <Link to="/admin/pengajuan" className="btn btn-primary" style={{ padding: '2rem' }}>Kelola Pengajuan Surat</Link>
        <Link to="/admin/pengaduan" className="btn btn-outline" style={{ padding: '2rem' }}>Kelola Pengaduan</Link>
      </div>
    </div>
  );
}
