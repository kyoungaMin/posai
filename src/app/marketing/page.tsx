"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Facebook, Upload, X, TrendingUp, Loader2,
  Share2, ThumbsUp, MessageCircle, Forward, Store, Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

export default function MarketingPage() {
  const { user } = useAuth();

  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookPageName, setFacebookPageName] = useState<string | null>(null);
  const [facebookPost, setFacebookPost] = useState("");
  const [facebookTopic, setFacebookTopic] = useState("");
  const [generatingPost, setGeneratingPost] = useState(false);
  const [postingToFacebook, setPostingToFacebook] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [marketingFile, setMarketingFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [marketingFilePreview, setMarketingFilePreview] = useState<string | null>(null);

  // 페이스북 연결 상태 확인
  useEffect(() => {
    const checkFacebookStatus = async () => {
      try {
        const res = await fetch("/api/social/facebook?action=status");
        const data = await res.json();
        setFacebookConnected(data.connected);
        setFacebookPageName(data.pageName);
      } catch {
        // 연결 안됨
      }
    };
    checkFacebookStatus();
  }, []);

  // URL 파라미터로 OAuth 콜백 결과 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fb_connected") === "true") {
      setFacebookConnected(true);
      const pageName = params.get("page_name");
      if (pageName) setFacebookPageName(pageName);
      window.history.replaceState({}, "", "/marketing");
    }
    if (params.get("fb_error")) {
      alert("페이스북 연결에 실패했습니다: " + params.get("fb_error"));
      window.history.replaceState({}, "", "/marketing");
    }
  }, []);

  const handleConnectFacebook = async () => {
    try {
      const res = await fetch("/api/social/facebook?action=auth-url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("페이스북 연결 설정이 필요합니다.");
      }
    } catch {
      alert("페이스북 연결에 실패했습니다.");
    }
  };

  const clearPreview = useCallback(() => {
    if (marketingFilePreview) URL.revokeObjectURL(marketingFilePreview);
  }, [marketingFilePreview]);

  useEffect(() => {
    return () => { clearPreview(); };
  }, [clearPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearPreview();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      setMarketingFile({ data: base64String, mimeType: file.type });
      setMarketingFilePreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePost = async () => {
    if (generatingPost) return;
    setGeneratingPost(true);
    try {
      const res = await fetch("/api/ai/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: marketingFile || undefined,
          customTopic: facebookTopic,
        }),
      });
      const json = await res.json();
      setFacebookPost(json.content);
      if (json.postId) setPostId(json.postId);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPost(false);
    }
  };

  const handlePostToFacebook = async () => {
    if (!facebookPost || postingToFacebook) return;
    setPostingToFacebook(true);
    try {
      const res = await fetch("/api/social/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", postId }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.demo
          ? "[데모 모드] 페이스북에 성공적으로 게시되었습니다!"
          : "페이스북에 성공적으로 게시되었습니다!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingToFacebook(false);
    }
  };

  const storeName = user?.storeName || "우리 매장";

  return (
    <>
      <Header title="대박 나는 마케팅" />
      <div className="bg-white p-6 md:p-10 rounded-4xl border border-orange-100 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1877F2] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Facebook className="text-white" size={32} />
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-800">페이스북 자동 홍보</h3>
              <p className="text-slate-400 text-sm font-medium">사진/동영상을 업로드하면 AI가 홍보글 초안을 만들어드려요.</p>
            </div>
          </div>
          {!facebookConnected ? (
            <button onClick={handleConnectFacebook}
              className="w-full md:w-auto bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100">
              <Facebook size={20} /> 페이스북 연결하기
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {facebookPageName ? `${facebookPageName} 연결됨` : "페이스북 연결됨"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload */}
            <div>
              <label className="block text-xs font-black text-orange-400 uppercase mb-3">홍보 미디어 업로드</label>
              {!marketingFilePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-orange-100 rounded-4xl cursor-pointer hover:bg-orange-50/50 transition-all group">
                  <div className="flex flex-col items-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-orange-300" size={32} />
                    </div>
                    <p className="mb-2 text-sm text-slate-500 font-bold">클릭하여 파일 업로드</p>
                    <p className="text-xs text-slate-400">PNG, JPG, MP4 (최대 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-4xl overflow-hidden border-4 border-orange-100">
                  {marketingFile?.mimeType.startsWith("video") ? (
                    <video src={marketingFilePreview} className="w-full h-64 object-cover" controls />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={marketingFilePreview} alt="Preview" className="w-full h-64 object-cover" />
                  )}
                  <button onClick={() => { clearPreview(); setMarketingFile(null); setMarketingFilePreview(null); }}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Topic + Generated Post */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-orange-400 uppercase mb-3">홍보 주제 (선택)</label>
                <input type="text" value={facebookTopic} onChange={(e) => setFacebookTopic(e.target.value)}
                  placeholder="예: 신메뉴 출시, 주말 할인 이벤트" disabled={!facebookConnected}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-6 py-4 text-sm font-medium transition-all disabled:opacity-50" />
              </div>
              <div className="relative">
                <label className="block text-xs font-black text-orange-400 uppercase mb-3">AI 홍보 문구 초안</label>
                <textarea value={facebookPost} onChange={(e) => setFacebookPost(e.target.value)}
                  placeholder={facebookConnected ? "미디어를 업로드하고 'AI 초안 만들기'를 클릭하세요!" : "먼저 페이스북을 연결해주세요."}
                  disabled={!facebookConnected}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-[1.5rem] p-6 text-sm font-medium min-h-60 transition-all disabled:opacity-50" />
                {facebookConnected && (
                  <button onClick={handleGeneratePost} disabled={generatingPost}
                    className="absolute bottom-4 right-4 bg-white border border-orange-100 text-orange-500 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-orange-50 transition-all shadow-md">
                    {generatingPost ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
                    AI 초안 만들기
                  </button>
                )}
              </div>
            </div>

            {/* Preview */}
            {facebookPost && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-[fadeIn_0.3s_ease-out]">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">페이스북 게시물 미리보기</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Store size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{storeName}</div>
                      <div className="text-[10px] text-slate-400">방금 전 &middot; <Globe size={10} className="inline" /></div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-4">{facebookPost}</div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-around">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><ThumbsUp size={14} /> 좋아요</div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><MessageCircle size={14} /> 댓글 달기</div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><Forward size={14} /> 공유하기</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Tips + Post Button */}
          <div className="space-y-6">
            <div className="bg-orange-50/50 p-8 rounded-[1.5rem] border border-orange-100">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Share2 size={18} className="text-orange-500" /> 마케팅 팁
              </h4>
              <ul className="space-y-3 text-xs text-slate-500 font-medium list-disc pl-4">
                <li>사진이나 동영상을 올리면 AI가 시각 정보를 분석해 더 생생한 문구를 만들어줍니다.</li>
                <li>매장 데이터와 결합하여 현재 가장 인기 있는 메뉴를 추천하기도 합니다.</li>
                <li>게시 전 문구를 사장님의 취향에 맞게 조금만 다듬어보세요!</li>
                <li>페이스북 페이지에 게시하면 고객들의 반응을 실시간으로 확인할 수 있습니다.</li>
              </ul>
            </div>
            <button onClick={handlePostToFacebook}
              disabled={!facebookConnected || !facebookPost || postingToFacebook}
              className="w-full bg-slate-800 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl">
              {postingToFacebook ? <Loader2 className="animate-spin" size={24} /> : "페이스북에 지금 게시"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
