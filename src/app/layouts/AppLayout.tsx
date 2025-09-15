import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Outlet />
    </div>
  );
}
