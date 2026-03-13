export const metadata = { title: "서비스 이용약관 - POS AI SaaS" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-6">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold px-4 py-2 rounded-full mb-6">
            POS AI SaaS
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">서비스 이용약관</h1>
          <p className="text-slate-400 text-sm">최종 업데이트: 2026-03-11</p>
        </header>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 space-y-10 text-slate-600 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">1</span>
              목적
            </h2>
            <p>본 약관은 POS AI SaaS 서비스 이용과 관련하여 회사와 이용자 간 권리와 의무를 규정합니다.</p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">2</span>
              서비스 내용
            </h2>
            <p className="mb-3">POS AI SaaS는 다음 기능을 제공합니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["POS 데이터 분석", "매출 리포트", "AI 기반 마케팅 콘텐츠 생성", "SNS 자동 게시 기능", "매장 운영 분석"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-medium px-4 py-3 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">3</span>
              이용자의 의무
            </h2>
            <p className="mb-3">이용자는 다음 행위를 해서는 안됩니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["서비스 악용", "불법 콘텐츠 게시", "타인의 계정 도용", "시스템 공격"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">4</span>
              서비스 변경
            </h2>
            <p>회사는 서비스 개선을 위해 기능을 변경할 수 있습니다.</p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">5</span>
              서비스 중단
            </h2>
            <p className="mb-3">다음 경우 서비스가 중단될 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>서버 유지보수</li>
              <li>기술적 문제</li>
              <li>외부 서비스 장애</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">6</span>
              책임 제한
            </h2>
            <p className="mb-3">회사는 다음에 대해 책임을 지지 않습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>이용자의 과실로 발생한 손해</li>
              <li>외부 SNS 플랫폼 정책 변경</li>
              <li>제3자 서비스 문제</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">7</span>
              지적재산권
            </h2>
            <p>서비스 및 콘텐츠에 대한 모든 권리는 회사에 있습니다.</p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">8</span>
              약관 변경
            </h2>
            <p>회사는 약관을 변경할 수 있으며 변경 시 서비스 내 공지합니다.</p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">9</span>
              문의
            </h2>
            <div className="bg-slate-50 rounded-xl p-5 text-sm">
              <p><span className="font-bold text-slate-700">Email:</span> <a href="mailto:support@pos-ai-saas.com" className="text-orange-500 hover:underline">support@pos-ai-saas.com</a></p>
            </div>
          </section>
        </div>

        <footer className="text-center mt-10 text-xs text-slate-400">
          &copy; 2026 POS AI SaaS. All rights reserved.
        </footer>
      </article>
    </div>
  );
}
