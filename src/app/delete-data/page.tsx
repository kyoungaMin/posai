export const metadata = { title: "데이터 삭제 요청 - POS AI SaaS" };

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-6">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold px-4 py-2 rounded-full mb-6">
            POS AI SaaS
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">사용자 데이터 삭제 요청</h1>
          <p className="text-slate-400 text-sm">최종 업데이트: 2026-03-11</p>
        </header>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 space-y-10 text-slate-600 text-[15px] leading-relaxed">

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-700">
            POS AI SaaS는 사용자의 개인정보 보호를 중요하게 생각합니다.
            사용자는 언제든지 자신의 데이터를 삭제 요청할 수 있습니다.
          </div>

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">1</span>
              삭제 요청 방법
            </h2>
            <p className="mb-3">다음 이메일로 요청해 주세요.</p>
            <div className="bg-slate-50 rounded-xl p-5 text-sm mb-4">
              <p><span className="font-bold text-slate-700">Email:</span> <a href="mailto:support@pos-ai-saas.com" className="text-orange-500 font-bold hover:underline">support@pos-ai-saas.com</a></p>
            </div>
            <p className="mb-2 font-bold text-slate-700">요청 시 포함 정보:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>계정 이메일</li>
              <li>삭제 요청 내용</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">2</span>
              삭제 처리 기간
            </h2>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-800">
              데이터 삭제 요청은 접수 후 <strong>최대 7일 이내</strong> 처리됩니다.
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-sm font-black">3</span>
              삭제되는 정보
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {["사용자 계정 정보", "SNS 연동 정보", "서비스 이용 데이터"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              단, 법적 보관 의무가 있는 정보는 일정 기간 보관될 수 있습니다.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center text-sm font-black">F</span>
              Facebook 데이터 삭제 안내
            </h2>
            <p className="mb-4">
              Facebook을 통해 로그인한 사용자는 Facebook 계정 연결 해제 시
              자동으로 데이터 삭제 요청이 가능합니다.
            </p>
            <div className="bg-slate-50 rounded-xl p-5 text-sm">
              <p><span className="font-bold text-slate-700">관련 문의:</span> <a href="mailto:support@pos-ai-saas.com" className="text-orange-500 hover:underline">support@pos-ai-saas.com</a></p>
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
