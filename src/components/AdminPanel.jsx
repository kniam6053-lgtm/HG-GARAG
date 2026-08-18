import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Trash2, Edit, Eye, EyeOff, Calendar, Wrench } from 'lucide-react';
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
      {/* Header */}
      <div className="bg-[#0b141d]/80 border-b border-cyan-500/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-300 tracking-wide">HG GARAGE Admin</h1>
            <p className="text-cyan-200/70 text-sm">Welcome, {user?.email?.split('@')[0] || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-500/20">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'bookings'
                ? 'text-cyan-300 border-b-2 border-cyan-400'
                : 'text-cyan-200/50 hover:text-cyan-200'
            }`}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'parts'
                ? 'text-cyan-300 border-b-2 border-cyan-400'
                : 'text-cyan-200/50 hover:text-cyan-200'
            }`}
          >
            🔧 Parts
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3 tracking-wide">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Plus size={18} className="text-cyan-400" />
                  </div>
                  Tambah Booking
                </h3>
                
                <form onSubmit={handleAddBooking} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Nama Pelanggan</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pelanggan"
                      value={newBooking.customerName}
                      onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Nomor HP</label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={newBooking.phone}
                      onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Jenis Service</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tune Up, Oli, Ganti Rem"
                      value={newBooking.service}
                      onChange={(e) => setNewBooking({ ...newBooking, service: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Tanggal Service</label>
                    <input
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Jam Service</label>
                    <input
                      type="time"
                      value={newBooking.time}
                      onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-6 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  >
                    {loading ? 'Sedang menyimpan...' : '+ Tambah Booking'}
                  </button>
                </form>
              </div>
            </div>

            {/* Bookings List */}
            <div className="lg:col-span-2">
              <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-8 max-h-[700px] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-cyan-300 mb-6 tracking-wide">📋 Daftar Booking</h3>
                
                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-cyan-200/50">Belum ada booking</p>
                    <p className="text-cyan-200/30 text-xs mt-2">Booking akan tampil di sini setelah pelanggan melakukan pemesanan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-[#0d1d2b] p-5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-cyan-100 text-lg">{booking.customerName}</p>
                            <p className="text-cyan-400/70 text-sm">📱 {booking.phone}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-lg transition"
                            title="Hapus booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-cyan-500/10">
                          <div className="flex items-center gap-2 text-cyan-200">
                            <Wrench size={16} className="text-cyan-400/60" />
                            <span className="text-sm"><span className="font-semibold">Service:</span> {booking.service}</span>
                          </div>
                          <div className="flex items-center gap-2 text-cyan-200">
                            <Calendar size={16} className="text-cyan-400/60" />
                            <span className="text-sm"><span className="font-semibold">Tanggal:</span> {booking.date} {booking.time && `- ${booking.time}`}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`inline-block text-xs px-4 py-1.5 rounded-full font-semibold ${
                            booking.status === 'Completed' 
                              ? 'bg-green-500/25 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/25 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {booking.status === 'Completed' ? '✓ Selesai' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parts Tab */}
        {activeTab === 'parts' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Part Form */}
            <div className="lg:col-span-1">
              <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3 tracking-wide">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Plus size={18} className="text-cyan-400" />
                  </div>
                  Tambah Part
                </h3>
                
                <form onSubmit={handleAddPart} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Nama Part</label>
                    <input
                      type="text"
                      placeholder="Contoh: Oli, Busi, Kampas Rem"
                      value={newPart.partName}
                      onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pelumas, Kelistrikan"
                      value={newPart.category}
                      onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Harga (Rp)</label>
                    <input
                      type="number"
                      placeholder="Contoh: 50000"
                      value={newPart.price}
                      onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-cyan-200/70">Stock</label>
                    <input
                      type="number"
                      placeholder="Jumlah stok"
                      value={newPart.stock}
                      onChange={(e) => setNewPart({ ...newPart, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d1d2b] border border-cyan-500/40 rounded-xl text-cyan-100 placeholder-cyan-400/40 text-sm focus:border-cyan-400 focus:outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-6 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  >
                    {loading ? 'Sedang menyimpan...' : '+ Tambah Part'}
                  </button>
                </form>
              </div>
            </div>

            {/* Parts List */}
            <div className="lg:col-span-2">
              <div className="bg-[#0b141d]/95 border border-cyan-500/40 rounded-2xl p-8 max-h-[700px] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-cyan-300 mb-6 tracking-wide">🔧 Daftar Parts</h3>
                
                {parts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-cyan-200/50">Belum ada parts</p>
                    <p className="text-cyan-200/30 text-xs mt-2">Tambahkan part untuk menampilkan katalog sparepart</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parts.map((part) => (
                      <div key={part.id} className="bg-[#0d1d2b] p-5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-cyan-100 text-lg">{part.partName}</p>
                            <p className="text-cyan-400/70 text-sm">📂 {part.category}</p>
                          </div>
                          <button
                            onClick={() => handleDeletePart(part.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-lg transition"
                            title="Hapus part"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-cyan-500/10">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-cyan-200/70">Harga:</span>
                            <p className="text-lg font-bold text-cyan-300">Rp {part.price?.toLocaleString('id-ID') || 0}</p>
                          </div>
                          <span className="text-xs bg-blue-500/25 text-blue-400 px-4 py-1.5 rounded-full font-semibold border border-blue-500/30">
                            📊 Stock: {part.stock}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
