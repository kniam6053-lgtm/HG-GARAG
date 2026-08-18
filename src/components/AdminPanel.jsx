import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, X, Calendar, Wrench } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
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

export default function AdminPanel({ user, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });
  const [newPart, setNewPart] = useState({
    partName: '',
    category: '',
    price: '',
    stock: ''
  });

  // Load Bookings dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsList);
    });
    return unsubscribe;
  }, []);

  // Load Parts dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'parts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParts(partsList);
    });
    return unsubscribe;
  }, []);

  // Load Bookings dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsList);
    });
    return unsubscribe;
  }, []);

  // Load Parts dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'parts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParts(partsList);
    });
    return unsubscribe;
  }, []);

  // Handle Add Booking
  const handleAddBooking = async (e) => {
    e.preventDefault();
    
    if (!newBooking.customerName || !newBooking.phone || !newBooking.service || !newBooking.date) {
      ThemeSwal.fire('Error', 'Semua field harus diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: new Date(),
        status: 'Pending'
      });
      
      ThemeSwal.fire('Sukses!', 'Booking berhasil ditambahkan', 'success');
      setNewBooking({ customerName: '', phone: '', service: '', date: '', time: '' });
      setShowAddForm(false);
    } catch (error) {
      ThemeSwal.fire('Error', 'Gagal menambahkan booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Part
  const handleAddPart = async (e) => {
    e.preventDefault();
    
    if (!newPart.partName || !newPart.category || !newPart.price || !newPart.stock) {
      ThemeSwal.fire('Error', 'Semua field harus diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'parts'), {
        ...newPart,
        price: parseFloat(newPart.price),
        stock: parseInt(newPart.stock),
        createdAt: new Date()
      });
      
      ThemeSwal.fire('Sukses!', 'Part berhasil ditambahkan', 'success');
      setNewPart({ partName: '', category: '', price: '', stock: '' });
      setShowAddForm(false);
    } catch (error) {
      ThemeSwal.fire('Error', 'Gagal menambahkan part', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (id) => {
    ThemeSwal.fire({
      title: 'Hapus Booking?',
      text: 'Data tidak bisa dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'bookings', id));
          ThemeSwal.fire('Sukses', 'Booking dihapus', 'success');
        } catch (error) {
          ThemeSwal.fire('Error', 'Gagal menghapus booking', 'error');
        }
      }
    });
  };

  // Handle Delete Part
  const handleDeletePart = async (id) => {
    ThemeSwal.fire({
      title: 'Hapus Part?',
      text: 'Data tidak bisa dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'parts', id));
          ThemeSwal.fire('Sukses', 'Part dihapus', 'success');
        } catch (error) {
          ThemeSwal.fire('Error', 'Gagal menghapus part', 'error');
        }
      }
    });
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      ThemeSwal.fire('Logout', 'Anda berhasil logout', 'success');
      onLogout();
    } catch (error) {
      ThemeSwal.fire('Error', 'Gagal logout', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      {/* HEADER */}
      <div className="bg-[#0b141d]/80 border-b border-cyan-500/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-300 tracking-wide">HG GARAGE Admin</h1>
            <p className="text-cyan-200/70 text-sm">Welcome, {user?.email?.split('@')[0] || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-3xl border-2 border-cyan-500/30 bg-[#0b141d] p-3 shadow-xl flex gap-2">
          <button
            onClick={() => {
              setActiveTab('bookings');
              setShowAddForm(false);
            }}
            className={`flex-1 group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-all duration-200 ${
              activeTab === 'bookings'
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-cyan-500/30 bg-transparent hover:border-cyan-400/60'
            }`}
          >
            <Calendar className="w-5 h-5" style={{ color: activeTab === 'bookings' ? '#06b6d4' : '#6ee7b7' }} />
            <span className={`text-xs font-bold tracking-wider ${activeTab === 'bookings' ? 'text-cyan-300' : 'text-cyan-400/60 group-hover:text-cyan-400'}`}>
              BOOKINGS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('parts');
              setShowAddForm(false);
            }}
            className={`flex-1 group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-all duration-200 ${
              activeTab === 'parts'
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-cyan-500/30 bg-transparent hover:border-cyan-400/60'
            }`}
          >
            <Wrench className="w-5 h-5" style={{ color: activeTab === 'parts' ? '#06b6d4' : '#6ee7b7' }} />
            <span className={`text-xs font-bold tracking-wider ${activeTab === 'parts' ? 'text-cyan-300' : 'text-cyan-400/60 group-hover:text-cyan-400'}`}>
              PARTS
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* ADD BOOKING FORM SECTION */}
            <div className="p-6 rounded-3xl border-2 space-y-6 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b-2 pb-4" style={{ borderColor: '#1a1a1e' }}>
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl border-2 flex items-center justify-center bg-[#1a1a1e]" style={{ borderColor: '#06b6d4' }}>
                    <Plus className="w-6 h-6" style={{ color: '#06b6d4' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight text-left">Manajemen Booking Online</h3>
                    <p className="text-xs text-cyan-200/70 mt-0.5 text-left">Tambahkan booking baru untuk pelanggan.</p>
                  </div>
                </div>
              </div>

              {!showAddForm ? (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="flex items-center gap-2 font-black text-xs text-black px-5 py-2.5 rounded-xl transition shadow-lg hover:brightness-110 w-full sm:w-auto"
                  style={{ backgroundColor: '#06b6d4' }}
                >
                  <Plus className="w-4 h-4" /> Booking Baru
                </button>
              ) : (
                <form onSubmit={handleAddBooking} className="p-5 rounded-2xl border-2 space-y-4 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
                  <div className="flex items-center justify-between border-b-2 border-cyan-500/20 pb-3 gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-left" style={{ color: '#06b6d4' }}>
                      <Wrench className="w-4 h-4" /> Form Booking Servis Baru
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="text-cyan-400/60 hover:text-cyan-300 transition p-1 bg-cyan-500/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-cyan-200/70 mb-1">Nama Pelanggan</label>
                      <input
                        type="text"
                        placeholder="Masukkan nama pelanggan"
                        value={newBooking.customerName}
                        onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                        className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-cyan-200/70 mb-1">Nomor HP</label>
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={newBooking.phone}
                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                        className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-cyan-200/70 mb-1">Layanan yang Dibutuhkan</label>
                      <textarea
                        rows="3"
                        placeholder="Tuliskan masalah motor atau layanan yang dibutuhkan..."
                        value={newBooking.service}
                        onChange={(e) => setNewBooking({ ...newBooking, service: e.target.value })}
                        className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-cyan-200/70 mb-1">Tanggal Service</label>
                        <input
                          type="date"
                          value={newBooking.date}
                          onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                          className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-200/70 mb-1">Jam Service</label>
                        <input
                          type="time"
                          value={newBooking.time}
                          onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                          className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-xl transition border border-cyan-500/30"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Sedang menyimpan...' : 'Simpan Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* BOOKINGS LIST */}
            <div className="p-6 rounded-3xl border-2 space-y-4 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Daftar Booking</h3>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-cyan-200/50">Belum ada antrean booking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((b) => (
                    <div 
                      key={b.id} 
                      className="p-4 rounded-2xl border-2 bg-[#0d1d2b] border-cyan-500/30 flex justify-between items-start cursor-pointer hover:border-cyan-400 transition"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-cyan-100">{b.customerName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            {b.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-200/70">📱 {b.phone}</p>
                        <p className="text-xs text-cyan-200/70">🔧 {b.service}</p>
                        <p className="text-xs text-cyan-200/70">📅 {b.date} {b.time && `- ${b.time}`}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400/70 hover:text-red-300 rounded-lg transition ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'parts' && (
          <div className="space-y-6">
            {/* ADD PART FORM SECTION */}
            <div className="p-6 rounded-3xl border-2 space-y-6 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b-2 pb-4" style={{ borderColor: '#1a1a1e' }}>
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl border-2 flex items-center justify-center bg-[#1a1a1e]" style={{ borderColor: '#06b6d4' }}>
                    <Plus className="w-6 h-6" style={{ color: '#06b6d4' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight text-left">Manajemen Parts & Sparepart</h3>
                    <p className="text-xs text-cyan-200/70 mt-0.5 text-left">Kelola katalog sparepart bengkel.</p>
                  </div>
                </div>
              </div>

              {!showAddForm ? (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="flex items-center gap-2 font-black text-xs text-black px-5 py-2.5 rounded-xl transition shadow-lg hover:brightness-110 w-full sm:w-auto"
                  style={{ backgroundColor: '#06b6d4' }}
                >
                  <Plus className="w-4 h-4" /> Part Baru
                </button>
              ) : (
                <form onSubmit={handleAddPart} className="p-5 rounded-2xl border-2 space-y-4 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
                  <div className="flex items-center justify-between border-b-2 border-cyan-500/20 pb-3 gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-left" style={{ color: '#06b6d4' }}>
                      <Wrench className="w-4 h-4" /> Form Tambah Part Baru
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="text-cyan-400/60 hover:text-cyan-300 transition p-1 bg-cyan-500/10 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-cyan-200/70 mb-1">Nama Part</label>
                      <input
                        type="text"
                        placeholder="Contoh: Oli, Busi, Kampas Rem"
                        value={newPart.partName}
                        onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                        className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-cyan-200/70 mb-1">Kategori</label>
                      <input
                        type="text"
                        placeholder="Contoh: Pelumas, Kelistrikan"
                        value={newPart.category}
                        onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                        className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-cyan-200/70 mb-1">Harga (Rp)</label>
                        <input
                          type="number"
                          placeholder="Contoh: 50000"
                          value={newPart.price}
                          onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                          className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyan-200/70 mb-1">Stock</label>
                        <input
                          type="number"
                          placeholder="Jumlah stok"
                          value={newPart.stock}
                          onChange={(e) => setNewPart({ ...newPart, stock: e.target.value })}
                          className="w-full bg-[#0d1d2b] border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 outline-none focus:border-cyan-300 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-xl transition border border-cyan-500/30"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Sedang menyimpan...' : 'Simpan Part'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* PARTS LIST */}
            <div className="p-6 rounded-3xl border-2 space-y-4 bg-[#0b141d]" style={{ borderColor: '#06b6d4' }}>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Daftar Parts</h3>

              {parts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-cyan-200/50">Belum ada parts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parts.map((part) => (
                    <div 
                      key={part.id} 
                      className="p-4 rounded-2xl border-2 bg-[#0d1d2b] border-cyan-500/30 flex justify-between items-start cursor-pointer hover:border-cyan-400 transition"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-cyan-100">{part.partName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            Tersedia
                          </span>
                        </div>
                        <p className="text-xs text-cyan-200/70">📂 {part.category}</p>
                        <p className="text-xs text-cyan-300 font-bold">💰 Rp {part.price?.toLocaleString('id-ID') || 0}</p>
                        <p className="text-xs text-cyan-200/70">📊 Stock: {part.stock} unit</p>
                      </div>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400/70 hover:text-red-300 rounded-lg transition ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
