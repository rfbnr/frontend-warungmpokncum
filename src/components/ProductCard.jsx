// src/components/ProductCard.jsx
export default function ProductCard({ item, onClick }) {
  if (!item) return null;
  const img = item.image_url || "";

  // render image from image public from assets
  // const publicImg = item.image_public || "";
  // if (publicImg) {
  //   const baseUrl = import.meta.env.VITE_API_BASE || "";
  //   const fullUrl =
  //     baseUrl.replace(/\/+$/, "") + "/" + publicImg.replace(/^\/+/, "");
  //   img = fullUrl;
  // }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full text-left rounded-2xl border bg-white shadow-card hover:shadow-lg transition-shadow">
      <div className="p-4 flex flex-col h-full">
        <div className="w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {/* {img ? ( */}
          <img
            // src={img}
            // ambil image dari public assets
            // src={`${import.meta.env.VITE_API_BASE || ""}/assets/${img}`}
            src={img || "/images/bakso-aci.jpg"}
            alt={item.name || "menu"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* ) : null} */}
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
