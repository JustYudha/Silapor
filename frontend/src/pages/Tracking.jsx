import { useState } from 'react';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Search, Clock } from 'lucide-react';

export default function Tracking() {
  const [nomor, setNomor] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await client.get(`/tracking/${nomor.trim().toUpperCase()}`);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Nomor tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const layanan = result?.layanan;

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Tracking Status Layanan</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
        Masukkan nomor tracking (contoh: SRV-20250523-ABC123 atau PGD-...)
      </p>

      <form onSubmit={handleSearch} className="card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: '1rem' }}
          placeholder="Nomor Tracking"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Search size={18} /> {loading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && layanan && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                {result.type === 'pengajuan' ? 'Pengajuan Surat' : 'Pengaduan Masyarakat'}
              </p>
              <h2 style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{layanan.nomor_tracking}</h2>
            </div>
            <StatusBadge status={layanan.status} />
          </div>

          {result.type === 'pengajuan' ? (
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div><strong>Jenis Surat</strong><p>{layanan.jenis_surat}</p></div>
              <div><strong>Pemohon</strong><p>{layanan.nama_pemohon}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Keperluan</strong><p>{layanan.keperluan}</p></div>
            </div>
          ) : (
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div><strong>Judul</strong><p>{layanan.judul}</p></div>
              <div><strong>Kategori</strong><p>{layanan.kategori}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Deskripsi</strong><p>{layanan.deskripsi}</p></div>
              {layanan.foto_url && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Foto (CDN ImageKit / S3)</strong>
                  <img src={layanan.foto_url} alt="Bukti" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
                </div>
              )}
            </div>
          )}

          {layanan.catatan_admin && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              <strong>Catatan Admin:</strong> {layanan.catatan_admin}
            </div>
          )}

          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Riwayat Status
          </h3>
          <div style={{ borderLeft: '3px solid var(--primary-light)', paddingLeft: '1.5rem' }}>
            {result.riwayat_status?.map((log, i) => (
              <div key={log.id} style={{ marginBottom: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.85rem', width: 12, height: 12, background: 'var(--primary)', borderRadius: '50%', top: 4 }} />
                <StatusBadge status={log.status_baru} />
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                  {new Date(log.created_at).toLocaleString('id-ID')}
                  {log.updated_by_name && ` · ${log.updated_by_name}`}
                </p>
                {log.keterangan && <p style={{ fontSize: '0.9rem' }}>{log.keterangan}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
