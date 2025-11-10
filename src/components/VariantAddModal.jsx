import { useEffect, useMemo, useState } from "react";

const DEFAULT_STYLES = {
  seblak: [
    { key: "kuah",   name: "Seblak Kuah" },
    { key: "kering", name: "Seblak Kering" },
  ],
  "mie tek tek": [
    { key: "goreng", name: "Mie Tek-Tek Goreng" },
    { key: "kuah",   name: "Mie Tek-Tek Kuah" },
  ],
  kwetiaw: [
    { key: "goreng", name: "Kwetiaw Goreng" },
    { key: "kuah",   name: "Kwetiaw Kuah" },
  ],
};

export default function VariantAddModal({
  open,
  item,
  addons = [],
  onClose,
  onConfirm, // (styleKey, styleLabel, variantId, selectedAddons[])
}) {
  const [step, setStep] = useState(1);
  const [styleKey, setStyleKey] = useState(null);
  const [styleLabel, setStyleLabel] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [picked, setPicked] = useState([]);
  const [hint, setHint] = useState("");

  const nameLc   = (item?.name ?? "").toLowerCase();
  const variants = item?.Variants ?? [];

  const styleOptions = useMemo(() => {
    const map = DEFAULT_STYLES[nameLc];
    return Array.isArray(map) ? map : [];
  }, [nameLc]);

  // ⭐ CHANGED: hitung estimasi agar ditampilkan di ringkasan
  const estimate = useMemo(() => {
    const base = Number(item?.base_price ?? 0);
    const v    = variants.find(v => v.id === variantId);
    const vAdd = Number(v?.extra_price ?? 0);
    const aAdd = picked.reduce((t,a)=> t + Number(a?.price ?? 0), 0);
    return base + vAdd + aAdd;
  }, [item?.base_price, variants, variantId, picked]);

  useEffect(() => {
    if (!open) return;
    setStyleKey(null);
    setStyleLabel(null);
    setVariantId(null);
    setPicked([]);
    setHint("");
    setStep(styleOptions.length > 0 ? 1 : 2);
  }, [open, item?.id, styleOptions.length]);

  const handlePickStyle = (s) => {
    setStyleKey(s.key);
    setStyleLabel(s.name);
    setHint("");

    const noVariants = (variants?.length ?? 0) === 0;
    const noAddons   = (addons?.length ?? 0) === 0;
    if (noVariants && noAddons) {
      onConfirm?.(s.key, s.name, null, []);
      return;
    }
    setStep(2);
  };

  const toggleAddon = (ad) => {
    setPicked((arr) => {
      const exist = arr.some((x) => x.id === ad.id);
      return exist ? arr.filter((x) => x.id !== ad.id) : [...arr, ad];
    });
  };

  const canSubmit = () => {
    if (styleOptions.length > 0 && !styleKey) return false;
    if (variants.length > 0 && (variantId === null || variantId === undefined)) return false;
    return true;
  };

  const submit = () => {
    if (!canSubmit()) {
      setHint(
        !styleKey && styleOptions.length > 0
          ? "Pilih jenis dulu."
          : "Pilih varian dulu."
      );
      return;
    }
    setHint("");
    onConfirm?.(styleKey, styleLabel, variantId, picked);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-[100]" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2
                   bg-white w-[92vw] max-w-lg max-h-[85vh]
                   rounded-2xl shadow-2xl overflow-hidden
                   flex flex-col"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b shrink-0">
          <div className="text-lg font-bold">{item?.name}</div>
          <div className="text-xs text-gray-500">
            {step === 1 ? "Pilih Jenis" : "Pilih Varian & Add-on"}
          </div>
          {styleLabel && step === 2 && (
            <div className="mt-1 text-xs text-brand-700">Jenis: {styleLabel}</div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-auto flex-1">
          {/* STEP 1: Jenis */}
          {step === 1 && (
            <>
              {styleOptions.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Item ini tidak membutuhkan pilihan jenis.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((s) => {
                    const active = styleKey === s.key;
                    return (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => handlePickStyle(s)}
                        // ⭐ CHANGED: state terpilih lebih tegas
                        className={
                          "relative border rounded-xl px-3 py-3 text-left " +
                          (active
                            ? "border-red-600 bg-red-50 ring-2 ring-red-400" // selected
                            : "hover:bg-gray-50")
                        }
                        aria-pressed={active}
                      >
                        {/* ⭐ CHANGED: cek ✓ di pojok saat terpilih */}
                        {active && (
                          <span className="absolute right-2 top-2 text-red-600 text-sm">✓</span>
                        )}
                        <div className={"font-medium " + (active ? "text-red-700" : "")}>
                          {s.name}
                        </div>
                        <div className="text-xs text-gray-500">{s.key}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* STEP 2: Varian & Add-on */}
          {step === 2 && (
            <>
              {/* Varian */}
              <div>
                <div className="text-sm font-semibold mb-2">Pilih Varian</div>
                {variants.length === 0 ? (
                  <div className="text-xs text-gray-500">Tidak ada varian.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {variants.map((v) => {
                      const active = variantId === v.id;
                      return (
                        <button
                          type="button"
                          key={v.id}
                          onClick={() => { setVariantId(v.id); setHint(""); }}
                          // ⭐ CHANGED: penanda varian terpilih
                          className={
                            "relative border rounded-xl px-3 py-3 text-left " +
                            (active
                              ? "border-red-600 bg-red-50 ring-2 ring-red-400"
                              : "hover:bg-gray-50")
                          }
                          aria-pressed={active}
                        >
                          {active && (
                            <span className="absolute right-2 top-2 text-red-600 text-sm">✓</span>
                          )}
                          <div className={"font-medium " + (active ? "text-red-700" : "")}>
                            {v.name}
                          </div>
                          {Number(v.extra_price || 0) > 0 && (
                            <div className="text-xs text-gray-500">
                              +Rp{Number(v.extra_price).toLocaleString()}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add-on */}
              <div>
                <div className="text-sm font-semibold mb-2">Add-on</div>
                {addons.length === 0 ? (
                  <div className="text-xs text-gray-500">Tidak ada add-on.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {addons.map((a) => {
                      const active = picked.some((x) => x.id === a.id);
                      return (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => toggleAddon(a)}
                          // ⭐ CHANGED: penanda add-on terpilih
                          className={
                            "relative border rounded-xl px-3 py-3 text-left " +
                            (active
                              ? "border-red-600 bg-red-50 ring-2 ring-red-400"
                              : "hover:bg-gray-50")
                          }
                          aria-pressed={active}
                        >
                          {active && (
                            <span className="absolute right-2 top-2 text-red-600 text-sm">✓</span>
                          )}
                          <div className={"font-medium " + (active ? "text-red-700" : "")}>
                            {a.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Rp{Number(a.price || 0).toLocaleString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ⭐ CHANGED: ringkasan pilihan + estimasi */}
          {(styleLabel || variantId || picked.length) && (
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 mb-2">Pilihan kamu</div>
              <div className="flex flex-wrap gap-2">
                {styleLabel && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
                    {styleLabel}
                  </span>
                )}
                {variantId && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
                    {variants.find(v=>v.id===variantId)?.name || "Varian"}
                  </span>
                )}
                {picked.map(p => (
                  <span
                    key={p.id}
                    className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200"
                  >
                    {p.name}
                  </span>
                ))}
                <span className="ml-auto px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border">
                  Estimasi: Rp{estimate.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {hint && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {hint}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0 bg-white">
          {step === 1 ? (
            <div className="flex items-center gap-3 justify-between">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">
                Batal
              </button>
              <button
                type="button"
                onClick={() =>
                  styleOptions.length === 0 ? setStep(2) : setHint("Pilih jenis dulu.")
                }
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Lanjut
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">
                Batal
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit()}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Tambah
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
