// frontend/src/lib/api.js
const BASE =
  (import.meta.env.VITE_API_BASE?.replace(/\/+$/, "")) ||
  "http://127.0.0.1:4000";

async function http(path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}\n${txt}`);
  }
  return res.json();
}

// ---------- PUBLIC ----------
export const getMenu = () => http("/api/public/menu");

export const createOrder = (payload) =>
  http("/api/public/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ---------- AUTH/KASIR ----------
export const kasirLogin = async ({ email, password }) =>
  http("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// list ringkas (max 100, backend urut desc by created_at)
export const kasirGetOrders = async (token) =>
  http("/api/kasir/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });

// detail 1 order (items + addons + payments)
export const kasirGetOrderDetail = async (token, orderId) =>
  http(`/api/kasir/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// mark paid
export const kasirMarkPaid = async (token, orderId, method = "CASH") =>
  http(`/api/kasir/orders/${orderId}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ method }),
  });

  // ... existing code di atas tetap

// ------- KASIR: QRIS ------- // NEW
export const kasirStartQris = async (token, orderId) => {
  return http(`/api/kasir/orders/${orderId}/qris/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const kasirQrisStatus = async (token, sessionId) => {
  return http(`/api/kasir/qris/${sessionId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const kasirQrisSimulatePaid = async (token, sessionId) => {
  return http(`/api/kasir/qris/${sessionId}/simulate-paid`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

