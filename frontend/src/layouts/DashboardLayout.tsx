import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
