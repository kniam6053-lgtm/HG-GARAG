import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Monitor Firebase Auth State
  useEffect(() => {
    // Listener ini dipanggil setiap kali user login/logout
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Jika TIDAK ada user yang login, tampilkan Login Form
  if (!user) {
    return <AdminLogin onLoginSuccess={setUser} />;
  }

  // ✅ Jika sudah login, tampilkan Admin Panel
  return <AdminPanel user={user} onLogout={() => setUser(null)} />;
}
