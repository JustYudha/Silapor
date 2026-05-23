import { useEffect, useState } from 'react';
import client from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function AdminPengaduan() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => client.get('/pengaduan/all').then((res) => setItems(res.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const catatan = prompt('Catatan admin (opsional):');
    await client.patch(`/pengaduan/${id}/status`, { status, catatan_admin: catatan });
    load();
  };

  if (loading) return <div className="container">Memuat...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Kelola Pengaduan Masyarakat</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{p.nomor_tracking}</strong>
                <p>{p.nama_pelapor} · {p.kategori}</p>
                <p style={{ fontWeight: 600 }}>{p.judul}</p>
                <p style={{ fontSize: '0.9rem' }}>{p.deskripsi}</p>
                {p.lokasi && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>📍 {p.lokasi}</p>}
              </div>
              <StatusBadge status={p.status} />
            </div>
            {p.foto_url && (
              <img src={p.foto_url} alt="Bukti" style={{ maxWidth: 300, borderRadius: 8, marginBottom: '1rem' }} />
            )}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['diproses', 'selesai', 'ditolak'].map((s) => (
                <button key={s} className="btn btn-sm btn-outline" onClick={() => updateStatus(p.id, s)} disabled={p.status === s}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
