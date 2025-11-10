export default function MenuCard({ item, addons, onAdd }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-sm text-gray-500 mt-1">
            Rp{item.base_price.toLocaleString()}
          </div>
        </div>
        {/* CTA utama */}
        <button
          className="px-3 py-1.5 bg-brand-700 text-white rounded-lg text-sm"
          onClick={() => onAdd(item, null, [])}
          aria-label={`Tambah ${item.name}`}
        >
          Tambah
        </button>
      </div>

      {/* Variants */}
      {item.Variants?.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Pilih level/varian</div>
          <div className="flex flex-wrap gap-2">
            {item.Variants.map((v) => (
              <button
                key={v.id}
                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-slate-50"
                onClick={() => onAdd(item, v, [])}
              >
                {v.name}
                {v.extra_price ? ` (+Rp${v.extra_price})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add-ons */}
      {addons?.length > 0 && (
        <div className="mt-5">
          <div className="text-sm font-medium mb-2">Add-on cepat</div>
          <div className="flex flex-wrap gap-2">
            {addons.map((a) => (
              <button
                key={a.id}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50"
                onClick={() => onAdd(item, null, [a])}
              >
                {a.name} (+Rp{a.price})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
