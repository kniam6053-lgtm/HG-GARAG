import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function BookingForm() {
  const [motorType, setMotorType] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('6282232433249');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = async () => {
    if (!motorType.trim() || !serviceName.trim() || !bookingTime.trim()) {
      alert('Mohon lengkapi Jenis Motor, Layanan, dan Waktu Kedatangan!');
      return;
    }

    setIsSubmitting(true);

    try {
      // SIMPAN DATA KE FIREBASE FIRESTORE
      await addDoc(collection(db, 'bookings'), {
        motorType: motorType,
        serviceName: serviceName,
        bookingTime: bookingTime,
        adminPhone: selectedAdmin,
        status: 'Antrean',
        createdAt: new Date()
      });

      // FORMAT PESAN WHATSAPP
      const message = `Halo Admin HG GARAGE!👋Mau booking slot servis nih biar motor tetep responsif dan enggak perlu ngantre lama di lokasi.• *Jenis Motor:* ${motorType}%0A• *Layanan:* ${serviceName}%0A• *Rencana Jam/Hari:* ${bookingTime}Kira-kira di jam segitu slotnya masih aman? Mohon konfirmasinya ya min, makasih!🙏`;

      // RESET FORM
      setMotorType('');
      setServiceName('');
      setBookingTime('');

      // BUKA WHATSAPP
      window.open(`https://wa.me/${selectedAdmin}?text=${message}`, '_blank');

    } catch (error) {
      console.error("Gagal menyimpan ke Firestore:", error);
      alert("Gagal koneksi ke server, dialihkan langsung ke WA.");
      
      const message = `Halo Admin HG GARAGE!👋Mau booking slot servis...• *Jenis Motor:* ${motorType}%0A• *Layanan:* ${serviceName}%0A• *Rencana Jam/Hari:* ${bookingTime}`;
      window.open(`https://wa.me/${selectedAdmin}?text=${message}`, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-white max-w-md mx-auto shadow-2xl">
      <h3 className="text-xl font-bold mb-4 text-center">Form Booking Service</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Jenis / Merk Motor</label>
          <input
            type="text"
            placeholder="Contoh: Vario 150 / NMAX / Beat"
            value={motorType}
            onChange={(e) => setMotorType(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Layanan yang Dibutuhkan</label>
          <input
            type="text"
            placeholder="Contoh: Servis Rutin & Ganti Oli"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Rencana Waktu / Jam Kedatangan</label>
          <input
            type="text"
            placeholder="Contoh: Besok Jam 10 Pagi"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Pilih Admin WhatsApp</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedAdmin('6282232433249')}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                selectedAdmin === '6282232433249'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              📱 Admin 1<br /><span className="text-[10px] opacity-75">0822-3243-3249</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAdmin('6285745184214')}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                selectedAdmin === '6285745184214'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              📱 Admin 2<br /><span className="text-[10px] opacity-75">0857-4518-4214</span>
            </button>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleBooking}
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-black font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95 mt-2"
        >
          {isSubmitting ? 'Menyimpan Booking...' : 'Kirim Booking ke WA →'}
        </button>
      </div>
    </div>
  );
}