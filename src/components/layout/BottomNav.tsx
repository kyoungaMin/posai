"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ImageIcon,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "홈", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "매출", icon: BarChart3 },
  { href: "/inventory", label: "재고", icon: Package },
  { href: "/marketing", label: "마케팅", icon: ImageIcon },
  { href: "/chat", label: "비서", icon: MessageSquare },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-orange-100 px-2 py-3 z-50 flex justify-around items-center md:hidden shadow-[0_-10px_20px_rgba(255,107,53,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              isActive ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : ""
              }`}
            >
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-black">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
