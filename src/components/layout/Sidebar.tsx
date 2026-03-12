"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ImageIcon,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "홈 대시보드", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "매출 분석", icon: BarChart3 },
  { href: "/inventory", label: "재고 및 발주", icon: Package },
  { href: "/marketing", label: "AI 마케팅", icon: ImageIcon },
  { href: "/chat", label: "AI 경영 비서", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-orange-100 p-6 z-20 hidden md:block">
      <Link href="/dashboard" className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
          <TrendingUp className="text-white" size={20} />
        </div>
        <h1 className="font-black text-xl tracking-tighter text-orange-600">POS 인사이트</h1>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-200 scale-[1.02]"
                  : "text-slate-400 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100 text-center">
          <p className="text-[10px] uppercase tracking-widest font-black text-orange-400 mb-2">
            오늘의 응원
          </p>
          <p className="text-xs text-orange-700 font-bold leading-relaxed">
            사장님, 오늘도
            <br />
            최고의 하루 되세요!
          </p>
        </div>
      </div>
    </aside>
  );
}
