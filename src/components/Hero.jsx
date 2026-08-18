import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Clock, MapPin } from 'lucide-react'

export default function Hero() {
  return (
    <header className="relative rounded-2xl overflow-hidden p-8 bg-gradient-to-br from-black/40 to-white/2 backdrop-blur-sm border border-white/5">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Bengkel Lokal, Pelayanan Kelas Digital</h1>
          <p className="mt-3 text-slate-300 max-w-xl">Solusi servis motor mobil dengan transparansi harga, booking online, dan konsultasi cepat via WhatsApp.</p>

          <div className="mt-6 flex items-center gap-4">
            <button className="px-5 py-3 bg-[#10B981] shadow-neon text-black font-semibold rounded-xl hover:scale-[1.02] transition">Booking Service Online</button>
            <button className="px-4 py-3 border border-white/10 rounded-xl text-slate-200 flex items-center gap-2 hover:bg-white/2 transition"> <Phone size={16}/> Konsultasi WhatsApp</button>
          </div>
        </div>

        <aside className="w-full lg:w-96">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="p-4 rounded-2xl bg-gradient-to-br from-white/3 to-white/5 border border-white/6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Status Antrean Bengkel</div>
                <div className="mt-1 font-semibold">3 Motor Sedang Diservis • Estimasi Tunggu 15 Menit</div>
              </div>
              <div className="text-sm text-slate-400 flex flex-col items-end">
                <div className="flex items-center gap-1"><Clock size={14}/> Buka 08:00 - 18:00</div>
                <div className="flex items-center gap-1 mt-1"><MapPin size={14}/> Desa Besar</div>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </header>
  )
}
