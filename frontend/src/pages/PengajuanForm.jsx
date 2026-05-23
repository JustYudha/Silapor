import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { FileText } from 'lucide-react';

export default function PengajuanForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ jenis_surat: 'domisili', keperluan: '' });
  const [dokumen, setDokumen] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const fd = new FormData();
    fd.append('jenis_surat', form.jenis_surat);
    fd.append('keperluan', form.keperluan);
    if (dokumen) fd.append('dokumen', dokumen);

    try {
      const res = await client.post('/pengajuan', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`Berhasil! Nomor tracking: ${res.data.data.nomor_tracking}`);
      setTimeout(() => navigate('/riwayat'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan surat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <FileText /> Pengajuan Surat Online
      </h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jenis Surat</label>
            <select value={form.jenis_surat} onChange={(e) => setForm({ ...form, jenis_surat: e.target.value })}>
              <option value="domisili">Surat Domisili</option>
              <option value="usaha">Surat Usaha</option>
              <option value="keterangan">Surat Keterangan</option>
              <option value="pengantar">Surat Pengantar</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label>Keperluan / Keterangan</label>
            <textarea rows={4} required value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Dokumen Pendukung (PDF) → Upload ke S3</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDokumen(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mengirim...' : 'Ajukan Surat'}
          </button>
        </form>
      </div>
    </div>
  );
}
