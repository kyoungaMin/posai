export const metadata = { title: "개인정보 처리방침 - POS AI SaaS" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-6">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold px-4 py-2 rounded-full mb-6">
            POS AI SaaS
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">개인정보 처리방침</h1>
          <p className="text-slate-400 text-sm">최종 업데이트: 2026-03-11</p>
        </header>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 space-y-10 text-slate-600 text-[15px] leading-relaxed">
          <p>
            POS AI SaaS(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요하게 생각하며
            관련 법령을 준수합니다. 본 개인정보 처리방침은 회사가 어떤 정보를 수집하고
            어떻게 사용하며 보호하는지를 설명합니다.
          </p>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">1</span>
              수집하는 개인정보
            </h2>
            <h3 className="font-bold text-slate-700 mb-2 mt-6">회원가입 및 서비스 이용</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>이메일</li>
              <li>이름</li>
              <li>전화번호</li>
              <li>사업자 정보</li>
              <li>접속 로그</li>
              <li>IP 주소</li>
              <li>쿠키</li>
            </ul>
            <h3 className="font-bold text-slate-700 mb-2 mt-6">SNS 연동 (Facebook 등)</h3>
            <p className="mb-2">사용자가 SNS 계정을 연결하는 경우 다음 정보를 수집할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Facebook 페이지 ID</li>
              <li>Facebook 페이지 이름</li>
              <li>게시 권한 토큰</li>
              <li>게시물 관리 권한</li>
            </ul>
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              이 정보는 SNS 자동 게시 기능 제공을 위해서만 사용됩니다.
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">2</span>
              개인정보 이용 목적
            </h2>
            <ol className="list-decimal pl-5 space-y-1 text-slate-500">
              <li>사용자 계정 관리</li>
              <li>POS 매출 분석 서비스 제공</li>
              <li>SNS 자동 마케팅 기능 제공</li>
              <li>고객 문의 대응</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>법적 의무 준수</li>
            </ol>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">3</span>
              개인정보 보관 기간
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 font-bold text-slate-700">정보 유형</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-700">보관 기간</th>
                  </tr>
                </thead>
                <tbody className="text-slate-500">
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">회원 정보</td><td className="px-5 py-3">회원 탈퇴 시까지</td></tr>
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">서비스 로그</td><td className="px-5 py-3">최대 3개월</td></tr>
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">법적 보관 정보</td><td className="px-5 py-3">관련 법령에 따름</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">4</span>
              개인정보 제3자 제공
            </h2>
            <p className="mb-3">회사는 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음 경우는 예외입니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 mb-4">
              <li>이용자가 동의한 경우</li>
              <li>법적 요구가 있는 경우</li>
              <li>서비스 제공을 위해 필요한 경우</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              {["Meta (Facebook API)", "Google Cloud", "Supabase"].map((s) => (
                <span key={s} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg">{s}</span>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">5</span>
              개인정보 처리 위탁
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 font-bold text-slate-700">업체</th>
                    <th className="text-left px-5 py-3 font-bold text-slate-700">역할</th>
                  </tr>
                </thead>
                <tbody className="text-slate-500">
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">Supabase</td><td className="px-5 py-3">데이터 저장</td></tr>
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">Google Cloud</td><td className="px-5 py-3">서버 및 AI 분석</td></tr>
                  <tr className="border-t border-slate-100"><td className="px-5 py-3">Meta</td><td className="px-5 py-3">SNS 게시 기능</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">6</span>
              개인정보 보호 조치
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {["HTTPS 암호화", "접근 권한 관리", "데이터 암호화", "서버 보안 관리"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">7</span>
              이용자의 권리
            </h2>
            <p className="mb-3">사용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 mb-4">
              <li>개인정보 열람</li>
              <li>개인정보 수정</li>
              <li>개인정보 삭제</li>
              <li>개인정보 처리 정지</li>
            </ul>
            <p>요청 방법: <a href="mailto:support@pos-ai-saas.com" className="text-orange-500 font-bold hover:underline">support@pos-ai-saas.com</a></p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">8</span>
              쿠키 사용
            </h2>
            <p className="mb-3">회사는 서비스 개선을 위해 쿠키를 사용할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>로그인 유지</li>
              <li>사용자 경험 개선</li>
              <li>서비스 통계 분석</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">9</span>
              개인정보 보호 책임자
            </h2>
            <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-1">
              <p><span className="font-bold text-slate-700">Email:</span> <a href="mailto:support@pos-ai-saas.com" className="text-orange-500 hover:underline">support@pos-ai-saas.com</a></p>
              <p><span className="font-bold text-slate-700">Service:</span> POS AI SaaS</p>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">10</span>
              정책 변경
            </h2>
            <p>본 개인정보 처리방침은 서비스 변경 및 법령 변경에 따라 수정될 수 있습니다.</p>
          </section>
        </div>

        <footer className="text-center mt-10 text-xs text-slate-400">
          &copy; 2026 POS AI SaaS. All rights reserved.
        </footer>
      </article>
    </div>
  );
}
