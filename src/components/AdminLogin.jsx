import React, { useState } from 'react';
import { Lock, EyeOff, Eye, X } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Swal from 'sweetalert2';

const ThemeSwal = Swal.mixin({
  background: '#0b141d',
  color: '#e5e7eb',
  confirmButtonColor: '#06b6d4',
  cancelButtonColor: '#374151',
  customClass: {
    popup: 'border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)]',
  }
});

export default function AdminLogin({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Convert username jadi email format untuk Firebase
  const usernameToEmail = (un) => `${un}@hggarage.com`;

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      ThemeSwal.fire('Error', 'Username dan password harus diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      const email = usernameToEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      ThemeSwal.fire('Sukses!', 'Login berhasil! Selamat datang Admin.', 'success');
      onLoginSuccess(userCredential.user);
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login gagal. Coba lagi!';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Username tidak terdaftar';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format username tidak valid';
      }
      
      ThemeSwal.fire('Login Gagal', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm relative">
        <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm relative">
          
          {/* ❌ TOMBOL SILANG UNTUK KELUAR */}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 p-1.5 rounded-full transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-center justify-center mb-6 pt-1">
            <div className="w-16 h-16 rounded-full bg-[#0a2332] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.5)]">
              <Lock className="w-8 h-8 text-cyan-300" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-cyan-300 text-center mb-1 tracking-wide">
            HG GARAGE
          </h1>
          <p className="text-cyan-200/70 text-center mb-6 text-[11px] italic font-medium">
            Admin Portal Masuk
          </p>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">
                Username Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Masukkan username"
                className="w-full px-3 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/50 text-xs focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-[#0d1d2b] border border-cyan-500/40 rounded-xl pl-10 pr-10 py-3 text-xs text-cyan-100 placeholder-cyan-400/50 outline-none focus:border-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-cyan-400/70 hover:text-cyan-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)] mt-2"
            >
              {loading ? 'Sedang memproses...' : 'MASUK'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}