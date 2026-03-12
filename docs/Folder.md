pos-insight-ai/
├── public/                 # 정적 에셋 (로고, 파비콘, 폰트, 기본 이미지 등)
├── src/
│   ├── app/                # 🌐 [핵심] 페이지 라우팅 및 서버 API (Next.js App Router)
│   │   ├── (auth)/         # 라우트 그룹 (URL에 포함되지 않음)
│   │   │   ├── login/page.tsx     # 로그인 페이지
│   │   │   └── signup/page.tsx    # 회원가입 페이지
│   │   ├── api/            # 🔒 백엔드 역할을 하는 서버리스 API 라우트
│   │   │   ├── ai/         # Gemini API 통신 처리 (프롬프트 조합 등)
│   │   │   │   ├── insight/route.ts  # 매출 분석 인사이트 요청
│   │   │   │   ├── marketing/route.ts# 마케팅 문구 생성 요청
│   │   │   │   └── chat/route.ts     # AI 경영 비서 채팅 (스트리밍)
│   │   │   ├── pos/        # POS 데이터 관련 API (가짜 데이터 또는 향후 실제 연동)
│   │   │   └── social/     # 페이스북 등 외부 SNS API 통신
│   │   ├── dashboard/      # 대시보드 (메인) 페이지
│   │   │   └── page.tsx
│   │   ├── inventory/      # 재고 관리 페이지
│   │   │   └── page.tsx
│   │   ├── marketing/      # AI 마케팅 페이지
│   │   │   └── page.tsx
│   │   ├── chat/           # AI 경영 비서 (채팅) 페이지
│   │   │   └── page.tsx
│   │   ├── layout.tsx      # 전역 레이아웃 (GNB, 사이드바 등 공통 UI)
│   │   └── page.tsx        # 랜딩 페이지 (서비스 소개 등)
│   │
│   ├── components/         # 🧩 재사용 가능한 UI 컴포넌트
│   │   ├── layout/         # Header, Sidebar 등 뼈대 UI
│   │   ├── ui/             # Button, Input, Modal 등 공통 기본 요소 (Tailwind 기반)
│   │   ├── dashboard/      # 대시보드 전용 컴포넌트 (SalesChart, RankList 등)
│   │   ├── inventory/      # 재고 전용 컴포넌트 (InventoryTable, AddItemModal 등)
│   │   └── chat/           # 채팅 전용 컴포넌트 (ChatBubble, MessageInput 등)
│   │
│   ├── lib/                # 🛠️ 외부 라이브러리 설정 및 공통 유틸리티
│   │   ├── supabase/       # Supabase 클라이언트 설정 (인증 및 DB 연결)
│   │   ├── gemini/         # Gemini API 호출을 위한 헬퍼 함수
│   │   └── utils.ts        # 날짜 포맷 변환, 텍스트 가공 등 공통 함수
│   │
│   ├── hooks/              # 🎣 커스텀 React 훅 (상태 관리, 데이터 패칭)
│   │   ├── useAuth.ts      # 로그인 상태 관리 훅
│   │   └── usePOSData.ts   # 실시간 POS 데이터 및 재고 데이터 로드 훅
│   │
│   └── types/              # 🏷️ TypeScript 타입 정의 파일
│       ├── database.ts     # Supabase DB 스키마 타입
│       ├── pos.ts          # 매출, 상품, 재고 관련 데이터 타입
│       └── ai.ts           # Gemini API 요청/응답 타입
│
├── .env.local              # 🔑 [보안] API 키, DB 비밀번호 등 환경변수 (Git 업로드 X)
├── tailwind.config.ts      # Tailwind CSS 디자인 시스템 설정 (메인/보조 컬러 정의)
└── package.json            # 프로젝트 의존성 관리