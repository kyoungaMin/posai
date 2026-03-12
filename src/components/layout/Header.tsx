"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  storeName?: string;
}

export default function Header({ title, subtitle = "오늘도 POS 인사이트가 함께합니다.", storeName }: HeaderProps) {
  const displayName = storeName || "사장님";
  const initial = displayName.charAt(0);

  return (
    <header className="flex justify-between items-center mb-6 md:mb-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1 md:mb-2 text-slate-800">
          {title}
        </h2>
        <p className="text-slate-400 text-[10px] md:text-sm font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-bold text-orange-500">Premium Member</span>
          <span className="text-sm font-black">{displayName}</span>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-100 border-2 border-orange-200 flex items-center justify-center font-black text-orange-600 text-base md:text-lg shadow-sm">
          {initial}
        </div>
      </div>
    </header>
  );
}
