import React from 'react'

const items = [
  { id:1, name: 'Siti, Pekon', text: 'Pelayanan cepat dan jujur. Harga transparan.' },
  { id:2, name: 'Pak Joko', text: 'Montirnya ahli, motor kembali prima!' }
]

export default function Testimonial(){
  return (
    <div className="p-6 rounded-3xl bg-[#121214] border border-zinc-800">
      <h3 className="text-lg font-semibold mb-4 text-white">Testimoni Pelanggan</h3>
      <div className="space-y-3">
        {items.map(it=> (
          <div key={it.id} className="p-4 rounded-2xl bg-[#0f1720]">
            <div className="font-medium">{it.name}</div>
            <div className="text-sm text-slate-300">{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
