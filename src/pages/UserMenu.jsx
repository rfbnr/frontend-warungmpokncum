import { useEffect, useMemo, useState } from "react";
import { getMenu, createOrder } from "../lib/api";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import VariantAddModal from "../components/VariantAddModal";

export default function UserMenu() {
  const [data, setData] = useState({ categories: [], addons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");
  const [pickItem, setPickItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await getMenu();
        const order = ["makanan", "minuman"];
        const categories = (d?.categories ?? [])
          .filter((c) => (c?.name ?? "").toLowerCase() !== "camilan")
          .sort(
            (a, b) =>
              order.indexOf((a?.name ?? "").toLowerCase()) -
              order.indexOf((b?.name ?? "").toLowerCase())
          );
        setData({ addons: d?.addons ?? [], categories });
      } catch (e) {
        setError(e.message || "Gagal memuat menu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const findCat = (nm) =>
    (data.categories ?? []).find(
      (c) => (c?.name ?? "").toLowerCase() === nm
    ) ?? { MenuItems: [] };

  const itemsMkn = findCat("makanan").MenuItems ?? [];
  const itemsMin = findCat("minuman").MenuItems ?? [];

  const arrangedDesktop = (() => {
    const arr = [];
    arr.push(...itemsMkn.slice(0, 3).filter(Boolean));
    if (itemsMkn[4]) arr.push(itemsMkn[4]);
    if (itemsMkn[3]) arr.push(itemsMkn[3]);
    if (itemsMin[0]) arr.push(itemsMin[0]);
    const rest = [...(itemsMin.slice(1) || []), ...(itemsMkn.slice(5) || [])].filter(Boolean);
    arr.push(...rest);
    return arr;
  })();

  // ===== CART =====
  const total = useMemo(
    () => cart.reduce((t, r) => t + (r.unit_estimate || 0) * r.qty, 0),
    [cart]
  );

  const openPick = (item) => {
    if (!item) return;
    console.log("[UserMenu] openPick:", item?.name);
    setPickItem(item);
    setModalOpen(true);
  };

  // from modal: (styleKey, styleLabel, variantId, addonsPicked[])
  const confirmAdd = (styleKey, styleLabel, variantId, addonsPicked) => {
    console.log("[UserMenu] confirmAdd from modal:", { styleKey, styleLabel, variantId, addonsPicked, pickItem });
    if (!pickItem) return;

    const variant =
      (pickItem?.Variants ?? []).find((v) => v.id === variantId) ?? null;
    const unit =
      Number(pickItem?.base_price ?? 0) +
      Number(variant?.extra_price ?? 0) +
      (addonsPicked ?? []).reduce((a, b) => a + Number(b?.price ?? 0), 0);

    const key = JSON.stringify({
      mid: pickItem.id,
      style: styleKey || null,
      vid: variant?.id ?? null,
      aids: (addonsPicked ?? []).map((a) => a.id).sort(),
    });

    setCart((c) => {
      const i = c.findIndex((x) => x.key === key);
      if (i >= 0) {
        const next = [...c];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [
        ...c,
        {
          key,
          menu_item_id: pickItem.id,
          name: pickItem.name,
          style_key: styleKey || null,
          style_name: styleLabel || null,
          variant_id: variant?.id ?? null,
          variant_name: variant?.name ?? null,
          addon_ids: (addonsPicked ?? []).map((a) => a.id).sort(),
          qty: 1,
          unit_estimate: unit,
        },
      ];
    });

    setModalOpen(false);
    setPickItem(null);
  };

  const inc = (key) =>
    setCart((c) => c.map((r) => (r.key === key ? { ...r, qty: r.qty + 1 } : r)));
  const dec = (key) =>
    setCart((c) =>
      c
        .map((r) => (r.key === key ? { ...r, qty: r.qty - 1 } : r))
        .filter((r) => r.qty > 0)
    );
  const del = (key) => setCart((c) => c.filter((r) => r.key !== key));

  const checkout = async () => {
    if (!cart.length) return;
    const payload = {
      customer_name: "",
      items: cart.map((r) => ({
        menu_item_id: r.menu_item_id,
        style_key: r.style_key || null,
        style_name: r.style_name || null,
        variant_id: r.variant_id,
        qty: r.qty,
        addon_ids: r.addon_ids,
      })),
    };
    const res = await createOrder(payload);
    setCart([]);
    setDrawerOpen(false);
    setToast(
      `Order #${res.order_id} dibuat • Total Rp${res.total_amount.toLocaleString()}`
    );
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div>
      <Hero />

      {/* LOADING / ERROR / EMPTY */}
      {loading ? (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
          Memuat menu…
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="rounded-xl border bg-white p-5 text-center">
            <div className="font-semibold text-red-600 mb-1">Gagal memuat menu</div>
            <div className="text-gray-600 text-sm break-all">{error}</div>
          </div>
        </div>
      ) : data.categories.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="inline-block rounded-xl border px-5 py-4 bg-white">
            <div className="font-semibold">Menu belum tersedia</div>
            <div className="text-gray-500 text-sm">
              Endpoint <code>/api/public/menu</code> kosong atau terfilter.
            </div>
          </div>
        </div>
      ) : null}

      {/* DESKTOP */}
      {!loading && !error && data.categories.length > 0 && (
        <>
          <div className="hidden xl:block max-w-7xl mx-auto px-6 pb-28">
            <h2 className="text-2xl font-extrabold mb-6">Makanan</h2>
            <div className="grid grid-cols-3 gap-8 justify-items-center">
              {arrangedDesktop.map((mi) =>
                mi ? (
                  <div key={`mi-${mi.id}`} className="w-[360px]">
                    <ProductCard item={mi} onClick={() => openPick(mi)} />
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* MOBILE/TABLET */}
          <div className="xl:hidden max-w-6xl mx-auto px-4 pb-28">
            {itemsMkn.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-extrabold mb-4">Makanan</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {itemsMkn.map((mi) => (
                    <ProductCard key={mi.id} item={mi} onClick={() => openPick(mi)} />
                  ))}
                </div>
              </section>
            )}
            {itemsMin.length > 0 && (
              <section className="mb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {itemsMin.map((mi) => (
                    <ProductCard
                      key={`min-xs-${mi.id}`}
                      item={mi}
                      onClick={() => openPick(mi)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {/* Bottom bar total */}
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 pb-3">
          <div className="rounded-2xl bg-white/90 backdrop-blur border shadow-card px-4 py-2 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500 mr-2">Total</span>
              <span className="font-bold">Rp{total.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 rounded-xl border"
              >
                Lihat Keranjang
              </button>
              <button
                disabled={!cart.length}
                onClick={checkout}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" // 🔴 CHANGED (Checkout bottom bar -> merah)
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Keranjang */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Keranjang</div>
              <button
                className="text-sm text-gray-500"
                onClick={() => setDrawerOpen(false)}
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3 text-sm">
              {cart.length === 0 ? (
                <div className="text-gray-500">Belum ada item.</div>
              ) : (
                cart.map((r) => (
                  <div key={r.key} className="rounded-xl border p-3">
                    <div className="font-medium">
                      {r.name}
                      {r.style_name ? ` • ${r.style_name}` : ""}
                      {r.variant_name ? ` • ${r.variant_name}` : ""}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {r.addon_ids?.length
                        ? `${r.addon_ids.length} add-on`
                        : "Tanpa add-on"}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dec(r.key)}
                          className="px-2.5 py-1 border rounded-lg"
                        >
                          −
                        </button>
                        <div className="w-8 text-center">{r.qty}</div>
                        <button
                          onClick={() => inc(r.key)}
                          className="px-2.5 py-1 border rounded-lg"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-semibold">
                        Rp{(r.unit_estimate * r.qty).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => del(r.key)}
                      className="mt-2 text-xs text-gray-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <div className="font-semibold">Total</div>
              <div className="font-bold">Rp{total.toLocaleString()}</div>
            </div>
            <div className="p-4">
              <button
                disabled={!cart.length}
                onClick={checkout}
                className="w-full py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" // 🔴 CHANGED (Checkout di drawer -> merah)
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      <VariantAddModal
        open={modalOpen}
        item={pickItem}
        addons={data.addons || []}
        onClose={() => {
          setModalOpen(false);
          setPickItem(null);
        }}
        onConfirm={(styleKey, styleLabel, variantId, selAddons) =>
          confirmAdd(styleKey, styleLabel, variantId, selAddons)
        }
      />

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
