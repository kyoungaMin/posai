"use client";

import type { TopMenu } from "@/types/pos";

interface RankListProps {
  topMenus: TopMenu[];
}

export default function RankList({ topMenus }: RankListProps) {
  return (
    <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
      <h3 className="font-black text-xl text-slate-800 mb-6">우리 매장 효자 메뉴</h3>
      <div className="space-y-4">
        {topMenus.map((menu, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-5 bg-orange-50/50 rounded-2xl hover:bg-orange-50 transition-colors cursor-default border border-transparent hover:border-orange-100"
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black shadow-sm ${
                  i === 0 ? "bg-amber-400 text-white" : "bg-white text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-black text-slate-800">{menu.menu_name}</p>
                <p className="text-xs font-bold text-slate-400">{menu.total_qty}개 판매됨</p>
              </div>
            </div>
            <p className="font-black text-orange-600">₩{menu.total_amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
