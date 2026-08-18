import React, { useState } from 'react';
import { Lock, LogIn, EyeOff, Eye } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // ✅ Convert username jadi email format untuk Firebase
  const usernameToEmail = (un) => `${un}@hggarage.com`;

  // ✅ Handle Login - Credentials HANYA dikirim ke Firebase
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      ThemeSwal.fire('Error', 'Username dan password harus diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      // Convert username ke email format untuk Firebase
      const email = usernameToEmail(username);
      
      // Kirim credentials ke Firebase - Firebase handle semua keamanan
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ Credentials TIDAK disimpan di frontend
      // Hanya token yang disimpan Firebase secara internal
      ThemeSwal.fire('Sukses!', 'Login berhasil! Selamat datang Admin.', 'success');
      
      // Panggil callback dengan user data
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

  // ✅ Handle Register - Password di-hash oleh Firebase
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      ThemeSwal.fire('Error', 'Username dan password harus diisi!', 'error');
      return;
    }

    if (password.length < 6) {
      ThemeSwal.fire('Error', 'Password minimal 6 karakter!', 'error');
      return;
    }

    if (!username.match(/^[a-zA-Z0-9_]+$/)) {
      ThemeSwal.fire('Error', 'Username hanya boleh huruf, angka, dan underscore!', 'error');
      return;
    }

    setLoading(true);
    try {
      // Convert username ke email format untuk Firebase
      const email = usernameToEmail(username);
      
      // Firebase akan hash password otomatis
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      ThemeSwal.fire('Sukses!', 'Akun admin berhasil dibuat! Silakan login.', 'success');
      setIsRegistering(false);
      setUsername('');
      setPassword('');
      
    } catch (error) {
      console.error('Register error:', error);
      
      let errorMessage = 'Registrasi gagal. Coba lagi!';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Username sudah terdaftar';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah';
      }
      
      ThemeSwal.fire('Registrasi Gagal', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card Login */}
        <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm">
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
            {isRegistering ? 'Buat Akun Admin Baru' : 'Admin Portal Masuk'}
          </p>

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">
                Username Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="admin_bengkel"
                className="w-full px-3 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/50 text-xs focus:border-cyan-400 focus:outline-none transition"
              />
              {isRegistering && (
                <p className="text-xs text-gray-400 mt-1">💡 Username hanya huruf, angka, underscore</p>
              )}
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

            <div className="text-[10px] text-cyan-200/70 bg-[#081b26] border border-cyan-500/20 rounded-lg px-3 py-2">
              {isRegistering ? 'Password minimal 6 karakter' : 'Credential: admin / admin123'}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              {loading ? 'Sedang memproses...' : isRegistering ? 'BUAT AKUN' : 'MASUK'}
            </button>

            {!isRegistering && (
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setUsername('');
                  setPassword('');
                  setShowPassword(false);
                }}
                className="w-full py-2.5 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300 font-bold text-[10px] tracking-wider rounded-xl transition uppercase"
              >
                BELUM PUNYA AKUN? DAFTAR
              </button>
            )}

            {isRegistering && (
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setUsername('');
                  setPassword('');
                  setShowPassword(false);
                }}
                className="w-full py-2.5 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300 font-bold text-[10px] tracking-wider rounded-xl transition uppercase"
              >
                SUDAH PUNYA AKUN? LOGIN
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
