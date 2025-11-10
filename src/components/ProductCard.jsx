// src/components/ProductCard.jsx
export default function ProductCard({ item, onClick }) {
  if (!item) return null;
  const img = item.image_url || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full text-left rounded-2xl border bg-white shadow-card hover:shadow-lg transition-shadow"
    >
      <div className="p-4 flex flex-col h-full">
        <div className="w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {img ? (
            <img
              src={img}
              alt={item.name || "menu"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>

        <div className="mt-3 flex-1 flex flex-col justify-end">
          <div className="font-extrabold text-lg leading-tight truncate">
            {item.name}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Rp{Number(item.base_price || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </button>
  );
}
