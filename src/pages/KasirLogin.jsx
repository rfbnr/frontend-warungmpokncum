// frontend/src/pages/KasirLogin.jsx
import { useState } from "react";
import { kasirLogin } from "../lib/api";

export default function KasirLogin({ onLogged }) {
  const [email, setEmail] = useState("kasir@warungmpokncum.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await kasirLogin({ email, password });
      // res: { token, user: { id, email, name, role } } sesuai backend-mu
      onLogged?.(res.token, res.user);
    } catch (e) {
      setErr(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white border rounded-2xl shadow-card p-6">
      <div className="text-xl font-bold mb-4">Login Kasir</div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kasir@warungmpokncum.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {err && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-2 rounded-xl bg-brand-700 text-white disabled:opacity-50"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
