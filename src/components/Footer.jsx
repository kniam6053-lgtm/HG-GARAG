import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-12 bg-[#070a10] py-10 border-t border-zinc-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f1720] px-4 py-2 text-xs uppercase tracking-[0.3em] font-semibold text-emerald-400">HG GARAGE</div>
          <p className="text-sm text-slate-400">Servis motor & sparepart original untuk berkendara aman dan nyaman.</p>
          <div className="text-sm text-slate-400">Jam Operasional: 08:00 - 22:00</div>
          <div className="text-sm text-slate-400">WhatsApp: +62 822-3243-3249</div>
        </div>

        <div className="space-y-3">
          <h5 className="text-sm uppercase tracking-[0.25em] text-zinc-500">Lokasi</h5>
          <p className="text-sm text-slate-400">Jemblong Garage — Jl. Raya Betet, Kec. Kasiman, Bojonegoro.</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=-7.143950392860253,111.6308807747593" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase text-black tracking-[0.15em] hover:bg-emerald-400 transition">Lihat di Maps</a>
        </div>

        <div className="space-y-3">
          <h5 className="text-sm uppercase tracking-[0.25em] text-zinc-500">Kontak Cepat</h5>
          <p className="text-sm text-slate-400">Konsultasi layanan, booking, atau cek estimasi biaya via WhatsApp.</p>
          <div className="rounded-2xl bg-[#0f1720] p-4 border border-zinc-800">
            <p className="text-sm font-semibold text-white">WA Support</p>
            <p className="text-sm text-slate-400">0822-3243-3249</p>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">© 2026 HG GARAGE — Semua hak dilindungi.</div>
    </footer>
  )
}
