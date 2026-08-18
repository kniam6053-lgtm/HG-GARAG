import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { 
  Package, 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  LogOut,
  X,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Palette,
  Wrench,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Wrench as ServiceIcon,
  Shield
} from 'lucide-react';

// Import Firebase Firestore Realtime
import { db } from './firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import AdminApp from './components/AdminApp';

// Konfigurasi SweetAlert2 Sesuai Tema HG GARAGE
const ThemeSwal = Swal.mixin({
  background: '#121816',
  color: '#e5e7eb',
  confirmButtonColor: '#10b981',
  cancelButtonColor: '#374151',
  customClass: {
    popup: 'border border-emerald-500/30 rounded-2xl shadow-2xl',
  }
});

function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        console.log("Autoplay video dicegah oleh browser:", error);
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
      >
        <source src="/video-animasi.mp4" type="video/mp4" />
        Browser Anda tidak mendukung pemutaran video.
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-black/60 to-[#080c14]/80 backdrop-blur-[2px]" />
    </div>
  );
}

// ==========================================
// UTAMA: APLIKASI HG GARAGE
// ==========================================
export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [showSparepartsList, setShowSparepartsList] = useState(false);

  // State Modal Login & Register (Username + Password Wajib untuk Pengunjung dan Admin)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginRole, setLoginRole] = useState('pelanggan');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [showWaModal, setShowWaModal] = useState(false);
  const bannerImage = '/desain-bengkel.jpg';

  const waAdmins = [
    {
      id: 1,
      title: 'Admin 1 (Booking, Sparepart, & Service)',
      number: '6285745184214',
      description: 'Layanan pendaftaran antrean & jadwal bengkel',
      message: 'Halo Admin 1, saya ingin bertanya tentang booking, sparepart, & service.'
    },
    {
      id: 2,
      title: 'Admin 2 (Mekanik)',
      number: '6282232433249', 
      description: 'Cek masalah service & konsultasi perbaikan',
      message: 'Halo Admin 2, saya ingin bertanya tentang service motor.'
    }
  ];


  // State Tema Warna
  const [themeMode, setThemeMode] = useState('emerald');
  const [customColor, setCustomColor] = useState('#3b82f6'); 
  const [activeFeature, setActiveFeature] = useState('booking');

  const featureTabs = [
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'sparepart', label: 'Sparepart', icon: Package },
    { id: 'history', label: 'Riwayat', icon: Tag },
    { id: 'services', label: 'Layanan', icon: Wrench }
  ];

  const getActiveColor = () => {
    if (themeMode === 'emerald') return '#10b981';
    if (themeMode === 'neon') return '#ec4899';
    return customColor;
  };

  const activeColor = getActiveColor();

  const formatBookingTimestamp = (timestamp) => {
    if (!timestamp) return 'Tidak tersedia';
    const dateObject = timestamp.toDate ? timestamp.toDate() : timestamp;
    return new Date(dateObject).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const buildBookingWaMessage = (data) => {
    const cleanedName = (data.name || 'Customer').trim();
    const cleanedPhone = (data.phone || '-').trim();
    const cleanedDate = (data.date || '-').trim();
    const cleanedService = (data.service || 'Belum dijelaskan').trim();

    return [
      'Halo Admin HG GARAGE👋',
      'Saya ingin melakukan booking antrean servis.',
      '',
      `Nama: ${cleanedName}`,
      `No WA: ${cleanedPhone}`,
      `Rencana Tanggal: ${cleanedDate}`,
      `Kebutuhan / Keluhan: ${cleanedService}`,
      '',
      'Mohon konfirmasinya, terima kasih🙏'
    ].join('\n');
  };

  // DATA SPAREPART REALTIME DARI FIREBASE
  const [spareparts, setSpareparts] = useState([]);

  // DATA BOOKING REALTIME DARI FIREBASE
  const [bookings, setBookings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RIWAYAT PENGHAPUSAN
  const [deletionLogs, setDeletionLogs] = useState([]);
  const [showDeletionHistory, setShowDeletionHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Form Data
const [formData, setFormData] = useState({ id: null, name: '', phone: '', date: '', service: '', selectedAdmin: '6285745184214' });
  const [showBookingForm, setShowBookingForm] = useState(true);

  // LOADING 3 DETIK
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // MENDENGARKAN DATA FIREBASE FIRESTORE SECARA REALTIME
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
    }, (error) => {
      console.error("Error fetching realtime bookings:", error);
    });
    return () => unsubscribe();
  }, []);

  // MENDENGARKAN SPAREPARTS REALTIME DARI FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'parts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().partName || doc.data().name,
        price: `Rp ${doc.data().price?.toLocaleString('id-ID') || 0}`,
        category: doc.data().category,
        stock: doc.data().stock
      }));
      setSpareparts(data);
    }, (error) => {
      console.error("Error fetching realtime spareparts:", error);
    });
    return () => unsubscribe();
  }, []);

  // MENDENGARKAN RIWAYAT PENGHAPUSAN SECARA REALTIME
  useEffect(() => {
    const q = query(collection(db, 'deletionHistory'), orderBy('deletedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDeletionLogs(data);
    }, (err) => {
      console.error('Error fetching deletion history:', err);
    });
    return () => unsub();
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    } catch (e) {
      return '';
    }
  };

  const handleOpenAbout = () => {
    setShowSettingsMenu(false);
    ThemeSwal.fire({
      title: 'Tentang HG GANK',
      html: `
        <p style="text-align:left; color:#d1d5db">HG GANK adalah sistem manajemen bengkel ringan untuk booking, katalog sparepart, dan komunikasi WA cepat.</p>
        <p style="text-align:left; color:#9ca3af; font-size:12px; margin-top:8px">Versi: 1.0 — Dibuat untuk demo dan operasional bengkel kecil.</p>
      `,
      confirmButtonText: 'Tutup'
    });
  };

  const handleOpenThemeSettings = () => {
    setShowSettingsMenu(false);
    ThemeSwal.fire({
      title: 'Pengaturan Tema',
      html: `
        <div style="text-align:left">
          <label style="display:block; margin-bottom:6px; color:#cbd5e1">Pilih Tema:</label>
          <select id="swal-theme-select" style="width:100%; padding:8px; background:#0f1720; color:#e5e7eb; border:1px solid #334155">
            <option value="emerald">Emerald (default)</option>
            <option value="neon">Neon</option>
            <option value="custom">Custom</option>
          </select>
          <label style="display:block; margin-top:8px; color:#cbd5e1">Warna Custom:</label>
          <input id="swal-theme-color" type="color" value="${customColor}" style="width:100%; height:36px; background:transparent; border:none;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        const sel = document.getElementById('swal-theme-select').value;
        const col = document.getElementById('swal-theme-color').value;
        return { sel, col };
      }
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        const { sel, col } = res.value;
        setThemeMode(sel);
        if (sel === 'custom') setCustomColor(col || customColor);
      }
    });
  };

  const handleExportHistoryCSV = () => {
    setShowSettingsMenu(false);
    try {
      if (!deletionLogs || deletionLogs.length === 0) {
        ThemeSwal.fire('Kosong', 'Tidak ada riwayat untuk diekspor.', 'info');
        return;
      }
      const rows = [ ['type','itemId','itemName','deletedBy','deletedAt','itemData'] ];
      deletionLogs.forEach((d) => {
        const date = d.deletedAt && d.deletedAt.toDate ? d.deletedAt.toDate().toISOString() : (d.deletedAt ? new Date(d.deletedAt).toISOString() : '');
        rows.push([d.type || '', d.itemId || '', d.itemName || '', d.deletedBy || '', date, JSON.stringify(d.itemData || {})]);
      });
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deletion_history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export CSV failed', e);
      ThemeSwal.fire('Gagal', 'Tidak dapat mengekspor riwayat.', 'error');
    }
  };

  const getStoredUsers = () => {
    try {
      const stored = localStorage.getItem('hggarage_users');
      if (!stored) {
        return {
          pelanggan: [{ fullName: 'Pengunjung', username: 'pengunjung', password: 'pengunjung123', phone: '081234567890' }],
          admin: [{ fullName: 'Admin', username: 'admin', password: 'admin123', phone: '081234567891' }]
        };
      }
      const parsed = JSON.parse(stored);
      return {
        pelanggan: parsed.pelanggan || [],
        admin: parsed.admin || []
      };
    } catch (error) {
      console.error('Gagal membaca user storage:', error);
      return {
        pelanggan: [{ fullName: 'Pengunjung', username: 'pengunjung', password: 'pengunjung123', phone: '081234567890' }],
        admin: [{ fullName: 'Admin', username: 'admin', password: 'admin123', phone: '081234567891' }]
      };
    }
  };

  const saveStoredUsers = (users) => {
    localStorage.setItem('hggarage_users', JSON.stringify(users));
  };

  // LOGIKA LOGIN UNTUK PENGUNJUNG DAN ADMIN (Username + Password wajib)
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const users = getStoredUsers();
    const trimmedUsername = loginUsername.trim();

    if (!trimmedUsername || !loginPassword.trim()) {
      setLoginError('Username dan password wajib diisi.');
      return;
    }

    // Strict role-based login
    const matchedUser = users[loginRole]?.find(
      (user) => user.username.toLowerCase() === trimmedUsername.toLowerCase() && user.password === loginPassword
    );

    if (matchedUser) {
      // Login dengan role yang sesuai
      setUserRole(loginRole);
      setShowLoginModal(false);
      setLoginUsername('');
      setLoginPassword('');
      setShowLoginPassword(false);
      setLoginError('');
      return;
    }

    setLoginError(
      loginRole === 'admin'
        ? 'Username atau password admin salah. Gunakan: admin / admin123'
        : 'Username atau password pengunjung salah. Gunakan: pengunjung / pengunjung123'
    );
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    const { fullName, username, phone, password, confirmPassword } = registerForm;
    const trimmedUsername = username.trim();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedUsername || !trimmedPhone || !password || !confirmPassword) {
      setRegisterError('Semua field wajib diisi.');
      return;
    }

    if (trimmedUsername.length < 4) {
      setRegisterError('Username minimal 4 karakter.');
      return;
    }

    if (password.length < 6) {
      setRegisterError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError('Konfirmasi password tidak cocok.');
      return;
    }

    const users = getStoredUsers();
    const exists = users.pelanggan.some((user) => user.username.toLowerCase() === trimmedUsername.toLowerCase());

    if (exists) {
      setRegisterError('Username sudah digunakan, silakan pilih username lain.');
      return;
    }

    const newUser = {
      fullName: trimmedName,
      username: trimmedUsername,
      phone: trimmedPhone,
      password,
    };

    const updatedUsers = {
      ...users,
      pelanggan: [...users.pelanggan, newUser]
    };
    saveStoredUsers(updatedUsers);

    setRegisterSuccess('Registrasi berhasil. Anda telah masuk sebagai pengunjung.');
    setUserRole('pelanggan');
    setShowRegisterModal(false);
    setRegisterForm({
      fullName: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setLoginError('');
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // ==========================================
  // FUNGSIONALITAS POP-UP SWEETALERT2
  // ==========================================

  // 1. TAMBAH SPAREPART
  const handleAddSparepart = (e) => {
    e?.stopPropagation();
    if (userRole !== 'admin') return;

    ThemeSwal.fire({
      title: 'Tambah Sparepart Baru',
      html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Nama Sparepart" style="background: #1f2937; color: #fff; border-color: #10b981;">
        <input id="swal-input-price" class="swal2-input" placeholder="Harga (Contoh: Rp 50.000)" style="background: #1f2937; color: #fff; border-color: #10b981;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const name = document.getElementById('swal-input-name').value;
        const price = document.getElementById('swal-input-price').value;
        if (!name || !price) {
          Swal.showValidationMessage('Nama dan Harga wajib diisi!');
        }
        return { name, price };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setSpareparts([
          ...spareparts,
          { id: Date.now(), name: result.value.name, price: result.value.price, category: 'General' }
        ]);
        ThemeSwal.fire('Tersimpan!', 'Sparepart baru berhasil ditambahkan.', 'success');
      }
    });
  };

  // 2. EDIT SPAREPART
  const handleEditSparepart = (item) => {
    if (userRole !== 'admin') return;

    ThemeSwal.fire({
      title: 'Edit Sparepart',
      html: `
        <label style="display:block; text-align:left; font-size:12px; margin-bottom:4px; color:#aaa;">Nama Sparepart:</label>
        <input id="swal-edit-name" class="swal2-input" value="${item.name}" style="background: #1f2937; color: #fff; border-color: #10b981;">
        <label style="display:block; text-align:left; font-size:12px; margin-top:10px; margin-bottom:4px; color:#aaa;">Harga Sparepart:</label>
        <input id="swal-edit-price" class="swal2-input" value="${item.price}" style="background: #1f2937; color: #fff; border-color: #10b981;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const name = document.getElementById('swal-edit-name').value;
        const price = document.getElementById('swal-edit-price').value;
        if (!name || !price) {
          Swal.showValidationMessage('Nama dan Harga tidak boleh kosong!');
        }
        return { name, price };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setSpareparts(spareparts.map(s => s.id === item.id ? { ...s, name: result.value.name, price: result.value.price } : s));
        ThemeSwal.fire({
          title: 'Berhasil Diperbarui!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // 3. HAPUS SPAREPART
  const handleDeleteSparepart = (id, name) => {
    if (userRole !== 'admin') return;

    ThemeSwal.fire({
      title: 'Hapus Sparepart?',
      html: `Apakah Anda yakin ingin menghapus <b style="color: #10b981;">"${name}"</b>?`,
      icon: 'warning',
      iconColor: '#f59e0b',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const removed = spareparts.find(s => s.id === id) || { id, name };
        setSpareparts(spareparts.filter(s => s.id !== id));
        try {
          await addDoc(collection(db, 'deletionHistory'), {
            type: 'sparepart',
            itemId: id,
            itemName: name,
            itemData: removed,
            deletedBy: userRole || 'admin',
            deletedAt: new Date()
          });
        } catch (err) {
          console.error('Gagal mencatat riwayat penghapusan sparepart:', err);
        }

        ThemeSwal.fire({
          title: 'Terhapus!',
          text: 'Sparepart telah dihapus dari daftar.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // 4. HAPUS BOOKING
  const handleDeleteBooking = (id, name) => {
    if (userRole !== 'admin') return;

    ThemeSwal.fire({
      title: 'Hapus Booking?',
      html: `Hapus data booking atas nama <b style="color: #10b981;">"${name}"</b>?`,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Ambil data sebelum dihapus agar bisa dipulihkan
          const docRef = doc(db, 'bookings', id);
          let dataSnapshot = null;
          try {
            const snap = await getDoc(docRef);
            if (snap.exists()) dataSnapshot = snap.data();
          } catch (e) {
            console.error('Gagal membaca data booking sebelum hapus:', e);
          }

          await deleteDoc(docRef);

          try {
            await addDoc(collection(db, 'deletionHistory'), {
              type: 'booking',
              itemId: id,
              itemName: name,
              itemData: dataSnapshot,
              deletedBy: userRole || 'admin',
              deletedAt: new Date()
            });
          } catch (err) {
            console.error('Gagal mencatat riwayat penghapusan booking:', err);
          }

          ThemeSwal.fire('Terhapus!', 'Antrean booking telah dihapus.', 'success');
        } catch (err) {
          ThemeSwal.fire('Gagal!', 'Terjadi kesalahan saat menghapus antrean.', 'error');
        }
      }
    });
  };

  const handleShowBookingDetail = (booking) => {
    const waPhone = booking.adminTarget === 'Admin 2' ? '6282232433249' : '6285745184214';
    const waMessage = encodeURIComponent(buildBookingWaMessage(booking));
    const bookingHistory = booking.createdAt ? formatBookingTimestamp(booking.createdAt) : 'Riwayat tidak tersedia';

    ThemeSwal.fire({
      title: `Detail Booking: ${booking.name}`,
      html: `
        <div class="text-left space-y-3 text-sm">
          <p><strong>Nama:</strong> ${booking.name}</p>
          <p><strong>No. WhatsApp:</strong> ${booking.phone}</p>
          <p><strong>Tanggal Servis:</strong> ${booking.date}</p>
          <p><strong>Tujuan Admin:</strong> ${booking.adminTarget || 'Admin 1'}</p>
          <p><strong>Keluhan / Jenis Servis:</strong><br/>${booking.service}</p>
          <p><strong>Riwayat Booking:</strong><br/>${bookingHistory}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Hubungi WA',
      cancelButtonText: 'Tutup',
      width: '440px'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(`https://wa.me/${waPhone}?text=${waMessage}`, '_blank');
      }
    });
  };

  // SIMPAN BOOKING KE FIRESTORE + BUKA WA ADMIN
  const handleBookingSubmit = async (e, adminNumber) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.service) {
      return ThemeSwal.fire('Peringatan', 'Silakan lengkapi semua data pendaftaran!', 'warning');
    }

    setIsSubmitting(true);
    const targetAdmin = adminNumber || formData.selectedAdmin;

    try {
      await addDoc(collection(db, 'bookings'), {
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        service: formData.service,
        adminTarget: targetAdmin === '6285745184214' ? 'Admin 1' : 'Admin 2',
        createdAt: new Date()
      });

      const message = encodeURIComponent(buildBookingWaMessage(formData));

      setFormData({ id: null, name: '', phone: '', date: '', service: '', selectedAdmin: '6285745184214' });
      setShowBookingForm(false);

      const options = waAdmins.reduce((acc, a) => { acc[a.number] = `${a.title} — ${a.number}`; return acc; }, {});
      ThemeSwal.fire({
        title: 'Pilih nomor WhatsApp untuk menghubungi',
        input: 'select',
        inputOptions: options,
        inputValue: targetAdmin,
        showCancelButton: true,
        confirmButtonText: 'Buka WhatsApp',
        cancelButtonText: 'Tutup'
      }).then((res) => {
        if (res.isConfirmed && res.value) {
          window.open(`https://wa.me/${res.value}?text=${message}`, '_blank');
        }
      });

    } catch (err) {
      console.error("Gagal menyimpan ke Firestore:", err);
      const message = `Halo Admin HG GARAGE👋Mau booking slot servis... • *Nama:* ${formData.name} • *Keluhan:* ${formData.service}`;
      const options = waAdmins.reduce((acc, a) => { acc[a.number] = `${a.title} — ${a.number}`; return acc; }, {});
      ThemeSwal.fire({
        title: 'Pilih nomor WhatsApp untuk menghubungi',
        input: 'select',
        inputOptions: options,
        inputValue: targetAdmin,
        showCancelButton: true,
        confirmButtonText: 'Buka WhatsApp',
        cancelButtonText: 'Tutup'
      }).then((res) => {
        if (res.isConfirmed && res.value) {
          window.open(`https://wa.me/${res.value}?text=${message}`, '_blank');
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // TAMPILAN ADMIN PORTAL
  if (showAdminPortal) {
    return <AdminApp />;
  }

  // TAMPILAN SPLASH LOADING
  if (isAppLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#06111e] flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
        <BackgroundVideo />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center max-w-sm bg-black/40 p-8 rounded-3xl border border-cyan-500/30 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 bg-cyan-500/20 rounded-full animate-ping"></div>
            <div className="w-20 h-20 rounded-2xl bg-[#0b2234]/90 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6)] z-10">
              <ServiceIcon className="w-10 h-10 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-cyan-300 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              HG GARAGE SYSTEM
            </h2>
            <p className="text-xs text-cyan-200/90 font-medium">By HG GANK Performance Team</p>
          </div>
          <div className="w-64 space-y-2">
            <div className="w-full bg-[#0d2130]/90 h-2.5 rounded-full overflow-hidden border border-cyan-500/40 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full animate-[progress_3s_ease-in-out_infinite] w-full origin-left"></div>
            </div>
            <p className="text-[11px] text-cyan-300 font-mono tracking-widest animate-pulse">Initializing Engine & System...</p>
          </div>
        </div>
      </div>
    );
  }

  // WELCOME SCREEN
  if (!userRole) {
    return (
      <div className="relative min-h-screen w-full bg-[#080c14] flex flex-col items-center justify-center p-4 overflow-hidden font-sans space-y-4 animate-in fade-in duration-500">
        <BackgroundVideo />
        <div className="relative z-10 w-full max-w-xl bg-[#121214]/85 border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-2 backdrop-blur-md">
          <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <img src={bannerImage} alt="HG GANK Banner" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="relative z-10 w-full max-w-xl bg-[#121214]/85 border-2 border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-left space-y-6 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-wider uppercase">SELAMAT DATANG</h2>
            <p className="text-xs text-zinc-400 font-medium">Silakan pilih akses masuk Anda untuk melanjutkan</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={() => {
                setShowAdminPortal(true);
              }}
              className="group p-5 bg-[#18181c]/90 hover:bg-red-900/30 border-2 border-red-600/50 hover:border-red-500 rounded-2xl flex flex-col items-start justify-center gap-2 transition duration-300 shadow-lg"
            >
              <div className="p-3 bg-red-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <span className="font-bold text-sm text-white">ADMIN PORTAL</span>
              <span className="text-[10px] text-red-400/70 uppercase font-medium">SECURE LOGIN</span>
            </button>

            <button 
              type="button"
              onClick={() => {
                setRegisterError('');
                setRegisterSuccess('');
                setShowRegisterModal(true);
              }}
              className="group p-5 bg-[#18181c]/90 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-emerald-500 rounded-2xl flex flex-col items-start justify-center gap-2 transition duration-300 shadow-lg"
            >
              <div className="p-3 bg-zinc-900 rounded-xl">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="font-bold text-sm text-white">DAFTAR PENGUNJUNG</span>
              <span className="text-[10px] text-zinc-500 uppercase font-medium">BUAT AKUN BARU</span>
            </button>
          </div>
        </div>

        {/* MODAL LOGIN (USERNAME + PASSWORD) */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b141d]/95 border border-cyan-500/40 w-full max-w-sm rounded-2xl p-6 sm:p-8 relative shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center space-y-6">
              <button 
                onClick={() => { setShowLoginModal(false); setShowLoginPassword(false); setLoginUsername(''); setLoginPassword(''); setLoginError(''); }} 
                className="absolute right-4 top-4 text-cyan-400/60 hover:text-cyan-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex justify-center pt-1">
                <div className="w-16 h-16 rounded-full bg-[#0a2332] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                  <Lock className="w-8 h-8 text-cyan-300" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-cyan-300 tracking-wide">
                  {loginRole === 'admin' ? 'Login Admin' : 'Login Pengunjung'}
                </h3>
                <p className="text-[11px] text-cyan-200/70 italic font-medium">
                  Masukkan username dan password untuk melanjutkan
                </p>
              </div>
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">Username</label>
                  <div className="relative flex items-center">
                    <UserCheck className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={loginRole === 'admin' ? 'Masukkan username admin' : 'Masukkan username pengunjung'}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-[#0d1d2b] border border-cyan-500/40 rounded-xl pl-10 py-3 text-xs text-cyan-100 placeholder-cyan-400/50 outline-none focus:border-cyan-400 transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder={loginRole === 'admin' ? 'Masukkan password admin' : 'Masukkan password pengunjung'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#0d1d2b] border border-cyan-500/40 rounded-xl pl-10 pr-10 py-3 text-xs text-cyan-100 placeholder-cyan-400/50 outline-none focus:border-cyan-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 text-cyan-400/70 hover:text-cyan-300 transition"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-cyan-200/70 bg-[#081b26] border border-cyan-500/20 rounded-lg px-3 py-2">
                  {loginRole === 'admin'
                    ? 'Credential: admin / admin123'
                    : 'Credential: pengunjung / pengunjung123'}
                </div>

                {loginError && <p className="text-[11px] text-red-400 mt-2 text-center font-semibold">{loginError}</p>}

                <button 
                  type="submit" 
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  MASUK
                </button>

                {loginRole === 'pelanggan' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginError('');
                      setLoginUsername('');
                      setLoginPassword('');
                      setShowLoginPassword(false);
                      setRegisterError('');
                      setRegisterSuccess('');
                      setShowRegisterModal(true);
                    }}
                    className="w-full py-2.5 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300 font-bold text-[10px] tracking-wider rounded-xl transition uppercase"
                  >
                    BELUM PUNYA AKUN? DAFTAR
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* MODAL REGISTER PENGUNJUNG */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b141d]/95 border border-emerald-500/40 w-full max-w-md rounded-2xl p-6 sm:p-8 relative shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center space-y-6">
              <button
                type="button"
                onClick={() => { setShowRegisterModal(false); setRegisterError(''); setRegisterSuccess(''); setRegisterForm({ fullName: '', username: '', phone: '', password: '', confirmPassword: '' }); setShowRegisterPassword(false); setShowRegisterConfirmPassword(false); }}
                className="absolute right-4 top-4 text-emerald-400/60 hover:text-emerald-300 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center pt-1">
                <div className="w-16 h-16 rounded-full bg-[#102d1c] border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <UserCheck className="w-8 h-8 text-emerald-300" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-emerald-300 tracking-wide">Daftar Pengunjung</h3>
                <p className="text-[11px] text-emerald-200/70 italic font-medium">Buat akun untuk booking dan cek layanan bengkel</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">Nama Lengkap</label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-[#0d1d2b] border border-emerald-500/40 rounded-xl px-3 py-3 text-xs text-emerald-50 placeholder-emerald-200/50 outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">Username</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="Buat username"
                    className="w-full bg-[#0d1d2b] border border-emerald-500/40 rounded-xl px-3 py-3 text-xs text-emerald-50 placeholder-emerald-200/50 outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-[#0d1d2b] border border-emerald-500/40 rounded-xl px-3 py-3 text-xs text-emerald-50 placeholder-emerald-200/50 outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Buat password"
                      className="w-full bg-[#0d1d2b] border border-emerald-500/40 rounded-xl pr-10 px-3 py-3 text-xs text-emerald-50 placeholder-emerald-200/50 outline-none focus:border-emerald-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 text-emerald-400/70 hover:text-emerald-300 transition"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">Konfirmasi Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      placeholder="Ulangi password"
                      className="w-full bg-[#0d1d2b] border border-emerald-500/40 rounded-xl pr-10 px-3 py-3 text-xs text-emerald-50 placeholder-emerald-200/50 outline-none focus:border-emerald-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      className="absolute right-3 text-emerald-400/70 hover:text-emerald-300 transition"
                    >
                      {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {registerError && <p className="text-[11px] text-red-400 text-center font-semibold">{registerError}</p>}
                {registerSuccess && <p className="text-[11px] text-emerald-400 text-center font-semibold">{registerSuccess}</p>}

                <button type="submit" className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs tracking-wider rounded-xl transition uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  DAFTAR
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setLoginRole('pelanggan');
                    setLoginError('');
                    setShowLoginModal(true);
                  }}
                  className="w-full py-2.5 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 font-bold text-[10px] tracking-wider rounded-xl transition uppercase"
                >
                  SUDAH PUNYA AKUN
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
  {showLoginModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <AdminLogin 
      onLoginSuccess={(user) => {
        setShowLoginModal(false);
      }} 
      onClose={() => setShowLoginModal(false)} // 👈 Panggil fungsi ini saat tombol 'X' diklik
    />
  </div>
)}

  // DASHBOARD UTAMA BENGKEL
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-16">
      {/* NAVBAR */}
      <nav className="border-b-2 border-zinc-900 bg-black sticky top-0 z-40 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="relative p-0 bg-transparent rounded-full focus:outline-none">
              <img 
                src="/logo-hg.png" 
                alt="HG GANK Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-zinc-800 object-cover shadow-md"
              />
            </button>
            {showSettingsMenu && (
              <div className="absolute left-4 top-16 z-50 w-56 bg-[#0b1114] border-2 border-zinc-800 rounded-xl shadow-2xl p-2">
                <button onClick={() => { setShowDeletionHistory(!showDeletionHistory); setShowSettingsMenu(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white">Riwayat</button>
                <button onClick={() => { handleOpenAbout(); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white">Tentang HG GANK</button>
                <button onClick={() => { handleOpenThemeSettings(); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white">Pengaturan Tema</button>
                <button onClick={() => { handleExportHistoryCSV(); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white">Ekspor Riwayat (CSV)</button>
                <button onClick={() => { setShowSettingsMenu(false); ThemeSwal.fire({ title: 'Kontak', html: '<p style="color:#cbd5e1">Hubungi tim HG Gank via WhatsApp atau email tim.</p>' }); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white">Kontak</button>
                <button onClick={() => { setShowSettingsMenu(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 text-sm text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
            <span className="font-black text-base sm:text-lg tracking-wider" style={{ color: activeColor }}>
              HG GARAGE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-400">
            <a href="#hero" className="hover:text-white transition">Layanan</a>
            <a href="#sparepart" className="hover:text-white transition">Sparepart</a>
            <a href="#booking" className="hover:text-white transition">Booking</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-[#141416] border-2 border-zinc-800 rounded-xl px-2.5 py-1.5 gap-2">
              <button onClick={() => setThemeMode('emerald')} style={{ backgroundColor: '#10b981' }} className={`w-5 h-5 rounded-full transition-all ${themeMode === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`}/>
              <button onClick={() => setThemeMode('neon')} style={{ backgroundColor: '#ec4899' }} className={`w-5 h-5 rounded-full transition-all ${themeMode === 'neon' ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`}/>
              <label style={{ backgroundColor: customColor }} className={`relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all ${themeMode === 'custom' ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`}>
                <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setThemeMode('custom'); }} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"/>
                <Palette className="w-3 h-3 text-white drop-shadow pointer-events-none" />
              </label>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border-2" style={{ backgroundColor: userRole === 'admin' ? '#083344' : '#022c22', borderColor: userRole === 'admin' ? '#22d3ee' : activeColor, color: userRole === 'admin' ? '#67e8f9' : activeColor }}>
              {userRole}
            </span>

            <button onClick={handleLogout} className="p-2 bg-[#141416] hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-zinc-800 rounded-xl transition" title="Keluar / Ganti Akses">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="py-8 md:py-10 px-4 max-w-4xl mx-auto space-y-5 text-left">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-zinc-800 shadow-2xl bg-[#121214]">
          <img src={bannerImage} alt="HG GANK Banner" className="w-full h-auto max-h-60 object-cover" />
        </div>
        <div className="inline-flex items-center justify-start gap-2 px-3 py-1 rounded-full bg-[#121214] border-2 border-zinc-800 text-xs font-bold" style={{ color: activeColor }}>
          <Clock className="w-3.5 h-3.5" />
          <span>Buka Hari Ini: 08.00 - 22.00 WIB</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-left">
            Servis Motor <span style={{ color: activeColor }}>Tanpa Ngantre.</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl leading-relaxed text-left">
            "Motor sehat, jalanan siap ditaklukkan. Booking servis secara kilat, ceritakan kendala motormu, dan pilih waktu terbaikmu bersama HG GARAGE."</p>
        </div>
        <div className="pt-1 flex flex-wrap justify-start gap-3">
          <a href="#booking" className="font-bold text-xs text-black px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg hover:brightness-110" style={{ backgroundColor: activeColor }}>
            <Calendar className="w-4 h-4" /> Booking Sekarang
          </a>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-10">
        <div className="rounded-3xl border-2 border-zinc-800 bg-[#121214] p-3 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featureTabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeFeature === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveFeature(id)}
                  className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-all duration-200 ${
                    isActive ? 'bg-[#1e2a2d] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-[#18181c] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className={`rounded-xl p-2.5 ${isActive ? 'bg-emerald-500/10' : 'bg-zinc-900'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeFeature === 'services' && (
          <section className="rounded-3xl border-2 border-zinc-800 bg-[#121214] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border-2 border-zinc-700 bg-[#1a1a1e] p-3">
                <Wrench className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Layanan Unggulan</h3>
                <p className="text-xs text-zinc-400">Pilih layanan yang sesuai kebutuhan motor Anda.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Servis Rutin & Tune-Up', desc: 'Pemeriksaan berkala agar performa tetap prima.', icon: Wrench },
                { title: 'Ganti Oli & Sparepart Original', desc: 'Produk berkualitas dan sesuai spesifikasi motor.', icon: Package },
                { title: 'Diagnosa Kelistrikan / Injeksi', desc: 'Solusi cepat untuk masalah starter hingga injeksi.', icon: Calendar },
                { title: 'Layanan Darurat / Panggilan Rumah', desc: 'Bantuan cepat saat motor Anda butuh penanganan darurat.', icon: ServiceIcon }
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-[#18181c] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-white">{title}</h4>
                  </div>
                  <p className="text-sm text-zinc-400">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeFeature === 'sparepart' && (
          <section id="sparepart" className="space-y-4">
            <div
              onClick={() => setShowSparepartsList(!showSparepartsList)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-xl group"
              style={{ backgroundColor: '#121214', borderColor: activeColor }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl border-2 flex items-center justify-center transition group-hover:rotate-6" style={{ backgroundColor: '#1a1a1e', borderColor: activeColor }}>
                  <Package className="w-7 h-7" style={{ color: activeColor }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 text-left">
                    Daftar Harga & Katalog Sparepart <Sparkles className="w-4 h-4" style={{ color: activeColor }} />
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 text-left">
                    Klik untuk {showSparepartsList ? 'menyembunyikan' : 'melihat'} daftar harga sparepart resmi ({spareparts.length} item)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {userRole === 'admin' && showSparepartsList && (
                  <button onClick={handleAddSparepart} className="hidden sm:flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                )}

                <div className="p-2 rounded-xl bg-[#1a1a1e] border-2 border-zinc-700 text-zinc-300 group-hover:text-white">
                  {showSparepartsList ? <ChevronUp className="w-5 h-5" style={{ color: activeColor }} /> : <ChevronDown className="w-5 h-5" style={{ color: activeColor }} />}
                </div>
              </div>
            </div>

            {showSparepartsList && (
              <div className="space-y-4 pt-2">
                {userRole === 'admin' && (
                  <div className="flex justify-end sm:hidden">
                    <button onClick={handleAddSparepart} className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg w-full justify-center">
                      <Plus className="w-4 h-4" /> Tambah Sparepart Baru
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {spareparts.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center" style={{ backgroundColor: '#121214', borderColor: activeColor }}>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border-2 uppercase" style={{ backgroundColor: '#1a1a1e', borderColor: activeColor, color: activeColor }}>
                          {item.category || 'General'}
                        </span>
                        <h4 className="font-extrabold text-base text-white tracking-tight">{item.name}</h4>
                        <p className="text-lg font-mono font-black" style={{ color: activeColor }}>{item.price}</p>
                      </div>

                      {userRole === 'admin' && (
                        <div className="flex items-center gap-1.5 ml-4">
                          <button onClick={() => handleEditSparepart(item)} className="p-2.5 rounded-xl bg-[#1a1a1e] hover:bg-zinc-800 text-zinc-400 hover:text-white transition border-2 border-zinc-700" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSparepart(item.id, item.name)} className="p-2.5 rounded-xl bg-[#1a1a1e] hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition border-2 border-zinc-700" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeFeature === 'booking' && (
          <section id="booking" className="pt-2">
            <div className="p-6 rounded-3xl border-2 space-y-6" style={{ backgroundColor: '#121214', borderColor: activeColor }}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b-2 pb-4" style={{ borderColor: '#1a1a1e' }}>
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl border-2 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e', borderColor: activeColor }}>
                    <Calendar className="w-6 h-6" style={{ color: activeColor }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight text-left">Manajemen Booking Online</h3>
                    <p className="text-xs text-zinc-400 mt-0.5 text-left">Tuliskan kebutuhan servis atau keluhan motor Anda.</p>
                  </div>
                </div>

                {!showBookingForm && (
                  <button onClick={() => setShowBookingForm(true)} className="flex items-center gap-2 font-black text-xs text-black px-5 py-2.5 rounded-xl transition shadow-lg hover:brightness-110" style={{ backgroundColor: activeColor }}>
                    <Plus className="w-4 h-4" /> Booking Baru
                  </button>
                )}
              </div>

              {showBookingForm && (
                <form onSubmit={(e) => handleBookingSubmit(e, formData.selectedAdmin)} className="p-5 rounded-2xl border-2 space-y-4" style={{ backgroundColor: '#18181c', borderColor: activeColor }}>
                  <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-left" style={{ color: activeColor }}>
                      <Wrench className="w-4 h-4" /> Form Booking Servis Baru
                    </h4>
                    <button type="button" onClick={() => setShowBookingForm(false)} className="text-zinc-400 hover:text-white transition p-1 bg-zinc-800 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nama Pembooking</label>
                      <input type="text" placeholder="Nama Lengkap Anda" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121214] border-2 border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition" required />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nomor WhatsApp Anda</label>
                      <input type="tel" placeholder="Contoh: 08123456789" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#121214] border-2 border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition" required />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tanggal Servis</label>
                      <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-[#121214] border-2 border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition" required />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tujuan Admin</label>
                      <select value={formData.selectedAdmin} onChange={(e) => setFormData({ ...formData, selectedAdmin: e.target.value })} className="w-full bg-[#121214] border-2 border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition">
                        <option value="6285745184214">Admin 1 (Booking & Service)</option>
                        <option value="6282232433249">Admin 2 (Mekanik / Konsultasi)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Keluhan / Jenis Servis</label>
                      <textarea rows="3" placeholder="Tuliskan masalah motor atau layanan yang dibutuhkan..." value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} className="w-full bg-[#121214] border-2 border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition" required></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowBookingForm(false)} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition">
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 font-bold text-xs text-black rounded-xl transition shadow-lg hover:brightness-110 flex items-center gap-2" style={{ backgroundColor: activeColor }}>
                      <MessageCircle className="w-4 h-4" /> {isSubmitting ? 'Menyimpan...' : 'Kirim & Kirim ke WhatsApp'}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Daftar Antrean Realtime ({bookings.length})
                </h4>

                {bookings.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-xs text-zinc-500">Belum ada antrean booking.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map((b) => (
                      <div key={b.id} className="p-4 rounded-2xl border-2 bg-[#18181c] border-zinc-800 flex justify-between items-start cursor-pointer hover:border-emerald-500/40 transition" onClick={() => handleShowBookingDetail(b)}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{b.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                              {b.adminTarget || 'Admin 1'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-400 font-semibold">{b.phone}</p>
                          <p className="text-xs text-zinc-300 line-clamp-2">{b.service}</p>
                          <p className="text-[10px] text-zinc-500">Tanggal Servis: {b.date}</p>
                        </div>

                        {userRole === 'admin' && (
                          <button onClick={(event) => { event.stopPropagation(); handleDeleteBooking(b.id, b.name); }} className="p-2 rounded-xl bg-[#121214] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition border border-zinc-700" title="Hapus Antrean">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeFeature === 'history' && userRole === 'admin' && (
          <section id="history" className="space-y-4">
            <div
              onClick={() => setShowDeletionHistory(!showDeletionHistory)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-xl group"
              style={{ backgroundColor: '#121214', borderColor: activeColor }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl border-2 flex items-center justify-center transition group-hover:rotate-6" style={{ backgroundColor: '#1a1a1e', borderColor: activeColor }}>
                  <Tag className="w-7 h-7" style={{ color: activeColor }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight text-left">Riwayat Penghapusan</h3>
                  <p className="text-xs text-zinc-400 mt-1 text-left">Catatan aksi penghapusan oleh admin (sparepart & booking)</p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#1a1a1e] border-2 border-zinc-700 text-zinc-300 group-hover:text-white">
                {showDeletionHistory ? <ChevronUp className="w-5 h-5" style={{ color: activeColor }} /> : <ChevronDown className="w-5 h-5" style={{ color: activeColor }} />}
              </div>
            </div>

            {showDeletionHistory && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Cari nama, tipe, atau admin..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-[#0f1316] border-2 border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                  />

                  <input
                    type="date"
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    className="bg-[#0f1316] border-2 border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                  />

                  <button
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryDateFilter('');
                    }}
                    className="px-3 py-2 bg-zinc-800 text-xs rounded-xl"
                  >
                    Reset
                  </button>

                  <button
                    onClick={async () => {
                      ThemeSwal.fire({
                        title: 'Hapus semua riwayat? ',
                        html: 'Semua entri riwayat akan dihapus permanen.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Ya, Hapus Semua',
                        cancelButtonText: 'Batal',
                        confirmButtonColor: '#ef4444'
                      }).then(async (res) => {
                        if (res.isConfirmed) {
                          try {
                            await Promise.all(deletionLogs.map((d) => deleteDoc(doc(db, 'deletionHistory', d.id))));
                            ThemeSwal.fire({ title: 'Selesai', text: 'Semua riwayat telah dihapus.', icon: 'success', timer: 1400, showConfirmButton: false });
                          } catch (err) {
                            console.error('Gagal menghapus semua riwayat:', err);
                            ThemeSwal.fire('Gagal', 'Terjadi kesalahan saat menghapus.', 'error');
                          }
                        }
                      });
                    }}
                    className="px-3 py-2 bg-red-600 text-white text-xs rounded-xl"
                  >
                    Hapus Semua
                  </button>
                </div>

                <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: '#18181c', borderColor: activeColor }}>
                  {deletionLogs.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-xs text-zinc-500">Belum ada riwayat penghapusan.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {deletionLogs
                        .filter((log) => {
                          const term = historySearch.trim().toLowerCase();
                          if (term) {
                            const inName = (log.itemName || '').toLowerCase().includes(term);
                            const inType = (log.type || '').toLowerCase().includes(term);
                            const inBy = (log.deletedBy || '').toLowerCase().includes(term);
                            if (!(inName || inType || inBy)) return false;
                          }
                          if (historyDateFilter) {
                            const d = log.deletedAt && log.deletedAt.toDate ? log.deletedAt.toDate() : new Date(log.deletedAt);
                            const iso = d.toISOString().slice(0, 10);
                            if (iso !== historyDateFilter) return false;
                          }
                          return true;
                        })
                        .map((log) => (
                          <div key={log.id} className="p-3 rounded-xl border-2 bg-[#121214] border-zinc-800 flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white">{log.itemName || '-'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{log.type}</span>
                              </div>
                              <p className="text-xs text-zinc-300">Dihapus oleh: <span className="font-semibold text-emerald-400">{log.deletedBy}</span></p>
                              <p className="text-[10px] text-zinc-500">Waktu: {formatTimestamp(log.deletedAt)}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={async () => {
                                    if (!log.itemData) {
                                      ThemeSwal.fire('Tidak bisa dipulihkan', 'Data asli tidak tersedia untuk pemulihan.', 'info');
                                      return;
                                    }

                                    if (log.type === 'sparepart') {
                                      try {
                                        const restored = { ...log.itemData };
                                        if (!restored.id) restored.id = Date.now();
                                        setSpareparts(prev => [...prev, restored]);
                                        await deleteDoc(doc(db, 'deletionHistory', log.id));
                                        ThemeSwal.fire({ title: 'Dipulihkan', text: 'Sparepart telah dikembalikan.', icon: 'success', timer: 1200, showConfirmButton: false });
                                      } catch (err) {
                                        console.error('Gagal memulihkan sparepart:', err);
                                        ThemeSwal.fire('Gagal', 'Terjadi kesalahan saat memulihkan sparepart.', 'error');
                                      }
                                    } else if (log.type === 'booking') {
                                      try {
                                        const data = log.itemData || {};
                                        await addDoc(collection(db, 'bookings'), {
                                          ...data,
                                          restoredAt: new Date()
                                        });
                                        await deleteDoc(doc(db, 'deletionHistory', log.id));
                                        ThemeSwal.fire({ title: 'Dipulihkan', text: 'Booking telah dikembalikan ke daftar.', icon: 'success', timer: 1200, showConfirmButton: false });
                                      } catch (err) {
                                        console.error('Gagal memulihkan booking:', err);
                                        ThemeSwal.fire('Gagal', 'Terjadi kesalahan saat memulihkan booking.', 'error');
                                      }
                                    } else {
                                      ThemeSwal.fire('Tipe tidak dikenal', 'Tidak dapat memulihkan tipe ini.', 'error');
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-[#1a1a1e] hover:bg-emerald-600 text-zinc-300 hover:text-white transition border-2 border-zinc-700"
                                  title="Pulihkan Entri"
                                >
                                  Pulihkan
                                </button>

                                <button
                                  onClick={async () => {
                                    ThemeSwal.fire({
                                      title: 'Hapus entri riwayat ini?',
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonText: 'Ya, Hapus',
                                      cancelButtonText: 'Batal',
                                      confirmButtonColor: '#ef4444'
                                    }).then(async (r) => {
                                      if (r.isConfirmed) {
                                        try {
                                          await deleteDoc(doc(db, 'deletionHistory', log.id));
                                          ThemeSwal.fire({ title: 'Terhapus', text: 'Entri riwayat telah dihapus.', icon: 'success', timer: 1200, showConfirmButton: false });
                                        } catch (err) {
                                          console.error('Gagal menghapus entri riwayat:', err);
                                          ThemeSwal.fire('Gagal', 'Terjadi kesalahan saat menghapus entri.', 'error');
                                        }
                                      }
                                    });
                                  }}
                                  className="p-2 rounded-xl bg-[#1a1a1e] hover:bg-red-600 text-zinc-300 hover:text-white transition border-2 border-zinc-700"
                                  title="Hapus Entri"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* LOCATION MAP */}
      <section id="lokasi" className="py-6 px-4 max-w-4xl mx-auto">
        <div className="rounded-3xl overflow-hidden border-2 border-zinc-800 shadow-2xl bg-[#121214]">
          <div className="p-5 border-b-2 border-zinc-800">
            <h2 className="text-xl font-extrabold text-white">Lokasi Bengkel</h2>
            <p className="text-xs text-zinc-400 mt-2">Kunjungi Jemblong Garage untuk servis motor dan konsultasi langsung.</p>
          </div>
          <div className="w-full h-[320px] sm:h-[420px]">
            <iframe
              title="Lokasi Jemblong Garage"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.844697776824!2d111.6308807747593!3d-7.143950392860253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e776500215f64c9%3A0x17228c509ff3c08c!2sJemblong%20Garage!5e0!3m2!1sid!2sid!4v1785215934597!5m2!1sid!2sid"
              width="100%"
              height="100%"
              className="border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="p-5 border-t-2 border-zinc-800 bg-[#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-zinc-400">Jemblong Garage</p>
              <p className="text-sm font-semibold text-white">Jl. Raya Betet, RT.09/RW.03, Betet, Kec. Kasiman, Kabupaten Bojonegoro, Jawa Timur 62164</p>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=-7.143950392860253,111.6308807747593"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition"
            >
              Buka Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}