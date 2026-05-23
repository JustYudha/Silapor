import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { MessageSquare, Camera } from 'lucide-react';

export default function PengaduanForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ judul: '', kategori: 'infrastruktur', deskripsi: '', lokasi: '' });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (foto) fd.append('foto', foto);

    try {
      const res = await client.post('/pengaduan', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(`Pengaduan terkirim! Tracking: ${res.data.data.nomor_tracking}`);
      setTimeout(() => navigate('/riwayat'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pengaduan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <MessageSquare /> Pengaduan Masyarakat
      </h1>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Judul Pengaduan</label>
            <input required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
              <option value="infrastruktur">Infrastruktur</option>
              <option value="kebersihan">Kebersihan</option>
              <option value="keamanan">Keamanan</option>
              <option value="pelayanan">Pelayanan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea rows={4} required value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Lokasi Kejadian</label>
            <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} placeholder="Jl. ..., RT/RW" />
          </div>
          <div className="form-group">
            <label><Camera size={16} style={{ display: 'inline' }} /> Foto Bukti → S3 + ImageKit CDN</label>
            <input type="file" accept="image/*" onChange={handleFoto} />
            {preview && <img src={preview} alt="Preview" style={{ maxWidth: '100%', marginTop: '0.75rem', borderRadius: 8 }} />}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </div>
    </div>
  );
}
