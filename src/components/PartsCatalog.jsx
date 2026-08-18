import React from 'react'
import { Package } from 'lucide-react'

const parts = [
  { id: 1, name: 'Oli Mesin 1L (Original)', price: 75000 },
  { id: 2, name: 'Filter Oli', price: 35000 },
  { id: 3, name: 'Busi NGK', price: 45000 },
  { id: 4, name: 'Aki (Maintenance Free)', price: 320000 }
]

export default function PartsCatalog(){
  return (
    <div className="p-6 rounded-3xl border border-zinc-800 bg-[#121214] shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-[#0b1118] text-emerald-400">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Katalog Sparepart</h3>
            <p className="text-sm text-zinc-400">Produk favorit untuk servis rutin motor Anda.</p>
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.35em] text-emerald-400">Terpercaya</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {parts.map(p=> (
          <div key={p.id} className="h-full rounded-3xl border border-zinc-800 bg-[#0c1116] p-4 transition hover:-translate-y-1 hover:border-emerald-500/40">
            <div className="flex flex-col gap-3 h-full">
              <div>
                <div className="text-base font-semibold text-white">{p.name}</div>
                <div className="text-sm text-zinc-500 mt-1">Transparan & bergaransi</div>
              </div>
              <div className="mt-auto self-start rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">Rp {p.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
