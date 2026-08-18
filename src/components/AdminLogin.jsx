import React, { useState } from 'react';
import { Lock, LogIn, EyeOff, Eye } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Swal from 'sweetalert2';

const ThemeSwal = Swal.mixin({
  background: '#121816',
  color: '#e5e7eb',
  confirmButtonColor: '#10b981',
  cancelButtonColor: '#374151',
  customClass: {
    popup: 'border border-emerald-500/30 rounded-2xl shadow-2xl',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Login */}
        <div className="bg-gray-900/50 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/30">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            HG GARAGE
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {isRegistering ? 'Buat Akun Admin Baru' : 'Admin Portal Masuk'}
          </p>

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="admin_bengkel"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
              />
              {isRegistering && (
                <p className="text-xs text-gray-400 mt-1">💡 Username hanya huruf, angka, underscore</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <LogIn size={20} />
              {loading ? 'Sedang memproses...' : isRegistering ? 'Buat Akun' : 'Login'}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setUsername('');
                setPassword('');
              }}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition"
            >
              {isRegistering 
                ? 'Sudah punya akun? Login di sini' 
                : 'Belum punya akun? Daftar di sini'}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-xs text-emerald-400 text-center">
              🔒 Password Anda terenkripsi dan aman di Firebase. Username tidak pernah ter-expose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
