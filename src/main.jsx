import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import UserMenu from "./pages/UserMenu";
import KasirLogin from "./pages/KasirLogin";
import KasirDashboard from "./pages/KasirDashboard";

function App(){
  const [tab,setTab]=useState("user");
  const [token,setToken]=useState(null);
  const [user,setUser]=useState(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="font-bold text-xl text-brand-700">Warung Mpok Ncum</div>
          <button className={tab==='user'?'font-semibold':''} onClick={()=>setTab('user')}>User</button>
          <button className={tab==='kasir'?'font-semibold':''} onClick={()=>setTab('kasir')}>Kasir</button>
          <div className="ml-auto text-sm text-gray-500">
            {token ? `Kasir: ${user?.name}` : 'Guest'}
          </div>
        </div>
      </nav>

      {tab==='user' && <UserMenu/>}
      {tab==='kasir' && (!token
        ? <KasirLogin onLogged={(t,u)=>{ setToken(t); setUser(u); }} />
        : <KasirDashboard token={token} />)}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
