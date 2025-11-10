import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrisModal({
  open,
  token,
  orderId,
  onClose,
  onPaid, // callback setelah SUCCESS
  api,    // { startQris, checkStatus, simulatePaid }
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [session, setSession] = useState(null); // {session_id, payload, expires_at, amount}
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("PENDING");
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!open) {
      cleanup();
      return;
    }
    (async () => {
      setBusy(true);
      setErr("");
      setSession(null);
      setStatus("PENDING");

      try {
        const s = await api.startQris(token, orderId);
        setSession(s);

        // render QR
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, s.payload, { width: 240 });
        }

        // countdown
        const ms = Math.max(0, new Date(s.expires_at) - new Date());
        setCount(Math.ceil(ms / 1000));
        timerRef.current = setInterval(() => {
          setCount((c) => (c > 0 ? c - 1 : 0));
        }, 1000);

        // polling status
        pollRef.current = setInterval(async () => {
          try {
            const st = await api.checkStatus(token, s.session_id);
            setStatus(st.status);
            if (st.status === "SUCCESS") {
              clearInterval(pollRef.current);
              clearInterval(timerRef.current);
              onPaid?.();
            }
            if (st.status === "EXPIRED" || st.status === "FAILED") {
              clearInterval(pollRef.current);
              clearInterval(timerRef.current);
            }
          } catch (e) {}
        }, 3000);
      } catch (e) {
        setErr(e.message || "Cannot start QRIS");
      } finally {
        setBusy(false);
      }
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    timerRef.current = null;
    pollRef.current = null;
    setSession(null);
    setStatus("PENDING");
    setCount(0);
    setErr("");
    setBusy(false);
  };

  const simulatePaid = async () => {
    if (!session) return;
    await api.simulatePaid(token, session.session_id);
    // polling loop akan menangkap SUCCESS pada next tick, tapi kita juga bisa paksa refresh:
    const st = await api.checkStatus(token, session.session_id);
    setStatus(st.status);
    if (st.status === "SUCCESS") {
      onPaid?.();
    }
  };

  if (!open) return null;

  const mm = (n)=> String(n).padStart(2,'0');
  const m = Math.floor(count / 60);
  const s = count % 60;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white w-[92vw] max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="text-lg font-bold">Bayar via QRIS</div>
          <div className="text-xs text-gray-500">Scan QR untuk menyelesaikan pembayaran</div>
        </div>

        <div className="p-5 space-y-4">
          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}

          <div className="flex flex-col items-center gap-3">
            <canvas ref={canvasRef} className="border rounded-xl p-2" />
            <div className="text-sm text-gray-600 break-all text-center">
              {session?.payload}
            </div>
            <div className="text-sm">
              Total: <b>Rp{Number(session?.amount || 0).toLocaleString()}</b>
            </div>
            <div className="text-xs text-gray-500">
              Status: {status} • {mm(m)}:{mm(s)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
            <button className="px-4 py-2 rounded-xl border" onClick={onClose} disabled={busy}>Tutup</button>
            <div className="flex items-center gap-2">
              {/* DEV only */}
              <button className="px-4 py-2 rounded-xl border" onClick={simulatePaid} disabled={busy || !session}>
                Simulate Paid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
