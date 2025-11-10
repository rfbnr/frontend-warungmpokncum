export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* watermark */}
      <img
        src="/images/logo-watermark.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 w-full h-full object-contain opacity-10 scale-110"
      />

      <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-900">
          Pesan Makanan Favorit<br />Anda
        </div>
        <p className="mt-4 text-sm md:text-base text-gray-600">
          Nikmati hidangan lezat dari restoran terbaik, diantar langsung ke meja Anda
        </p>
        <div className="mt-6 text-xs tracking-widest font-semibold text-brand-600">
          WARUNG SEBLAK MPOK NCUM
        </div>
      </div>
    </section>
  );
}
