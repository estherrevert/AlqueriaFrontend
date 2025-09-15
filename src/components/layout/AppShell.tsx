import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export default function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
