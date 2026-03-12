import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-slate-900 font-sans pb-20 md:pb-0">
      <Sidebar />
      <BottomNav />
      <main className="md:ml-64 p-4 md:p-10 pb-24 md:pb-10">{children}</main>
    </div>
  );
}
