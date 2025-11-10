import { useEffect, useState } from "react";
import {
  kasirGetOrders as _kasirGetOrders, // kalau kamu sebelumnya pakai nama beda, sesuaikan
  kasirMarkPaid as _kasirMarkPaid,
  kasirGetOrderDetail as _kasirGetOrderDetail,
  kasirStartQris,
  kasirQrisStatus,
  kasirQrisSimulatePaid,
} from "../lib/api";
import QrisModal from "../components/QrisModal";

export default function KasirDashboard({ token }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [qrisOrderId, setQrisOrderId] = useState(null); // NEW: order yg sedang QRIS

  const api = {
    startQris: kasirStartQris,
    checkStatus: kasirQrisStatus,
    simulatePaid: kasirQrisSimulatePaid,
  };

  const load = () => _kasirGetOrders(token).then(setOrders);
  useEffect(() => {
    load();
  }, []);

  const toggleDetail = async (id) => {
    if (expanded[id]) {
      setExpanded((e) => {
        const n = { ...e };
        delete n[id];
        return n;
      });
    } else {
      const detail = await _kasirGetOrderDetail(token, id);
      setExpanded((e) => ({ ...e, [id]: detail }));
    }
  };

  const pay = async (id, method) => {
    await _kasirMarkPaid(token, id, method);
    await load();
  };

  const openQris = (id) => {
    setQrisOrderId(id);
  };

  const onQrisPaid = async () => {
    setQrisOrderId(null);
    await load();
  };

  const printReceipt = (id) => {
    const base = (
      import.meta.env.VITE_API_BASE || "http://127.0.0.1:4000"
    ).replace(/\/+$/, "");
    const url = `${base}/api/kasir/orders/${id}/receipt?token=${encodeURIComponent(
      token,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Kasir</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((o) => {
          const detail = expanded[o.id];
          return (
            <div
              key={o.id}
              className="bg-white border rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Order #{o.id}</div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    o.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                  {o.status}
                </div>
              </div>
              <div className="text-sm mt-2">
                Total: <b>Rp{o.total_amount?.toLocaleString()}</b>
              </div>
              <div className="text-sm">Metode: {o.payment_method}</div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {/* <button
                  onClick={() => toggleDetail(o.id)}
                  className="px-3 py-1 rounded-lg border">
                  {detail ? "Tutup Detail" : "Lihat Detail"}
                </button> */}

                {/* <button
                  onClick={() => printReceipt(o.id)}
                  className="px-3 py-1 rounded-lg border"
                >
                  Print
                </button> */}

                {o.status !== "PAID" && (
                  <>
                    <button
                      className="px-3 py-1 rounded-lg bg-green-700 text-white"
                      onClick={() => pay(o.id, "CASH")}>
                      Mark Paid (Cash)
                    </button>
                    {/* NEW: QRIS */}
                    <button
                      className="px-3 py-1 rounded-lg border border-brand-500 text-brand-700"
                      onClick={() => openQris(o.id)}>
                      Bayar via QRIS
                    </button>
                  </>
                )}
              </div>

              {detail && (
                <div className="mt-4 border-t pt-3 space-y-3 text-sm">
                  {detail.OrderItems?.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {it.menu_name}{" "}
                          {it.style_name ? `• ${it.style_name}` : ""}{" "}
                          {it.variant_name ? `• ${it.variant_name}` : ""}
                        </div>
                        <div className="text-gray-500">
                          x{it.qty} • Rp{it.unit_price.toLocaleString()} / item
                          {it.OrderItemAddons?.length
                            ? ` • ${it.OrderItemAddons.length} addon`
                            : ""}
                        </div>
                        {it.OrderItemAddons?.length > 0 && (
                          <ul className="mt-1 text-xs text-gray-500 list-disc ml-4">
                            {it.OrderItemAddons.map((oa) => (
                              <li key={oa.id}>
                                {oa.addon_name} (+Rp
                                {oa.addon_price.toLocaleString()})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="font-medium">
                        Rp{it.line_total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="text-gray-500">Belum ada order.</div>
        )}
      </div>

      {/* NEW: Modal QRIS */}
      <QrisModal
        open={!!qrisOrderId}
        token={token}
        orderId={qrisOrderId}
        onClose={() => setQrisOrderId(null)}
        onPaid={onQrisPaid}
        api={api}
      />
    </div>
  );
}
