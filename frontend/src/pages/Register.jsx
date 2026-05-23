import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { UserPlus, Upload } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', email: '', password: '', nik: '', no_hp: '', alamat: '' });
  const [ktpFile, setKtpFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      if (ktpFile) {
        const fd = new FormData();
        fd.append('ktp', ktpFile);
        await client.post('/auth/upload-ktp', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={24} /> Daftar Masyarakat
        </h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Registrasi untuk warga Kelurahan Kopo
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </div>
          <div className="form-group">
            <label>NIK (16 digit)</label>
            <input maxLength={16} value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label>No. HP</label>
            <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Alamat</label>
            <textarea rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          </div>
          <div className="form-group">
            <label><Upload size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Upload KTP (PDF/JPG) → S3</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKtpFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}
