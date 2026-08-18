import React from 'react'
import { Wrench, Droplet, Zap, Truck } from 'lucide-react'

const services = [
  { id: 1, title: 'Servis Rutin & Tune-Up', icon: Wrench },
  { id: 2, title: 'Ganti Oli & Sparepart Original', icon: Droplet },
  { id: 3, title: 'Diagnosa Kelistrikan / Injeksi', icon: Zap },
  { id: 4, title: 'Layanan Darurat / Panggilan Rumah', icon: Truck }
]

export default function ServicesGrid(){
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map(s => (
        <div key={s.id} className="p-6 rounded-3xl bg-[#111827] border border-zinc-800 hover:shadow-[0_10px_30px_rgba(16,185,129,0.12)] transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#0f1720] text-emerald-400"><s.icon size={20} /></div>
            <div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-slate-400">Cepat, transparan, dan bergaransi.</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
