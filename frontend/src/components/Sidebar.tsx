import { NavLink } from "react-router-dom";
import {
  Home,
  CreditCard,
  LayoutDashboard,
  Settings,
  Activity,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          color: "#3b82f6",
        }}
      >
        <CreditCard size={32} />
        <h1
          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f8fafc" }}
        >
          FinCards
        </h1>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Home size={20} />
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Activity size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/cards"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <CreditCard size={20} />
          Cards
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          Transactions
        </NavLink>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <NavLink to="/settings" className="nav-item">
          <Settings size={20} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
