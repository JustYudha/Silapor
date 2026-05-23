import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function Riwayat() {
  const [pengajuan, setPengajuan] = useState([]);
  const [pengaduan, setPengaduan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/pengajuan/my'),
      client.get('/pengaduan/my'),
    ]).then(([p, g]) => {
      setPengajuan(p.data.data);
      setPengaduan(g.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Memuat riwayat...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Riwayat Layanan Saya</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Pengajuan Surat</h2>
        {pengajuan.length === 0 ? (
          <p style={{ color: 'var(--gray-500)' }}>Belum ada pengajuan. <Link to="/pengajuan">Ajukan surat</Link></p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pengajuan.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <Link to={`/tracking?nomor=${p.nomor_tracking}`} style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                    {p.nomor_tracking}
                  </Link>
                  <p style={{ marginTop: '0.25rem' }}>{p.jenis_surat} — {p.keperluan?.substring(0, 60)}...</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{new Date(p.created_at).toLocaleString('id-ID')}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem' }}>Pengaduan</h2>
        {pengaduan.length === 0 ? (
          <p style={{ color: 'var(--gray-500)' }}>Belum ada pengaduan. <Link to="/pengaduan">Buat pengaduan</Link></p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pengaduan.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{p.nomor_tracking}</span>
                  <p style={{ marginTop: '0.25rem' }}>{p.judul} ({p.kategori})</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{new Date(p.created_at).toLocaleString('id-ID')}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
