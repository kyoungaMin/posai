# POS 인사이트 AI (POS Insight AI)

소상공인을 위한 **AI 기반 POS 데이터 분석 & 경영 자동화 SaaS**

POS 매출 데이터를 AI가 분석하여 실시간 인사이트, 수요 예측, 재고 관리, SNS 마케팅 자동화까지 한 번에 제공합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **대시보드** | 실시간 매출/주문/객단가 지표, 시간대별·요일별 차트, 상품 랭킹 |
| **AI 매출 예측** | Gemini AI 기반 일별/주간 매출 예측 및 날씨 연동 인사이트 |
| **재고 관리** | 재고 현황판, 안전재고 알림, 레시피 BOM 기반 자동 차감 |
| **AI 마케팅** | SNS 홍보 문구 자동 생성 (Facebook/Instagram/카카오) |
| **AI 경영 비서** | 매장 데이터 기반 1:1 채팅 컨설팅 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript 5.8 |
| **Database & Auth** | Supabase (PostgreSQL + Auth + RLS) |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Styling** | Tailwind CSS 3.4 + Framer Motion |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |

---

## 프로젝트 구조

```
posai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 로그인/회원가입
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/                # 대시보드
│   │   │   ├── page.tsx              # 메인 대시보드
│   │   │   ├── analytics/page.tsx    # 상세 분석
│   │   │   └── layout.tsx
│   │   ├── inventory/                # 재고 관리
│   │   ├── marketing/                # AI 마케팅
│   │   ├── chat/                     # AI 경영 비서
│   │   ├── api/                      # API Routes (서버 사이드)
│   │   │   ├── ai/                   # AI 관련 (insight, chat, marketing, predict)
│   │   │   ├── pos/                  # POS 데이터 (dashboard, analytics, inventory)
│   │   │   └── social/              # SNS 연동 (facebook)
│   │   ├── layout.tsx               # 루트 레이아웃
│   │   ├── page.tsx                 # 랜딩 페이지
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                      # 공통 UI (StatCard, Modal)
│   │   ├── layout/                  # 레이아웃 (Sidebar, BottomNav, Header)
│   │   ├── dashboard/               # 대시보드 위젯
│   │   ├── inventory/               # 재고 컴포넌트
│   │   └── chat/                    # 채팅 컴포넌트
│   │
│   ├── hooks/                       # 커스텀 훅 (useAuth, usePOSData)
│   ├── lib/                         # 유틸리티 & 클라이언트
│   │   ├── supabase/client.ts       # Supabase 클라이언트
│   │   ├── gemini/client.ts         # Gemini AI (서버 전용)
│   │   ├── mock-data.ts             # Phase 1 가상 데이터
│   │   └── utils.ts                 # 포맷팅 유틸
│   └── types/                       # TypeScript 타입 정의
│       ├── database.ts              # DB 스키마 타입 (19개 테이블)
│       ├── pos.ts                   # 프론트엔드 데이터 타입
│       └── ai.ts                    # AI 요청/응답 타입
│
├── supabase/
│   └── migrations/                  # SQL 마이그레이션
│       ├── 001_initial_schema.sql   # 기본 10개 테이블
│       ├── 002_rls_policies.sql     # RLS 멀티테넌트 격리
│       ├── 003_seed_data.sql        # 데모 시드 데이터
│       ├── 004_enhanced_schema.sql  # 고도화 9개 테이블
│       └── 005_seed_bom.sql         # 레시피 BOM 시드
│
├── docs/                            # 프로젝트 문서
│   ├── ServicePlan.md               # 서비스 기획서
│   ├── database.md                  # DB 설계서 (ERD, 테이블 상세)
│   ├── Folder.md                    # 폴더 구조 명세
│   ├── devlog/                      # 개발일지
│   ├── terms.md                     # 이용약관
│   ├── privacy.md                   # 개인정보처리방침
│   └── delete-data.md               # 데이터 삭제 정책
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.js
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Supabase 프로젝트 (또는 Phase 1 Mock 모드로 실행 가능)
- Google Gemini API Key

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 API 키 입력

# 3. 개발 서버 실행
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

### 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `GEMINI_API_KEY` | O | Google Gemini AI API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | O | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | - | Supabase 서비스 역할 키 (서버 전용) |
| `FACEBOOK_APP_ID` | - | Facebook 앱 ID (마케팅 기능) |
| `FACEBOOK_APP_SECRET` | - | Facebook 앱 시크릿 |

---

## 데이터베이스

Supabase (PostgreSQL) 기반, 총 **19개 테이블**로 구성됩니다.

### 핵심 테이블 (Phase 1)
`stores` → `profiles` → `menus` → `sales` → `inventory` → `daily_summary`

### 고도화 테이블 (Phase 2~5)
`sales_orders` / `sales_order_items` / `refunds` / `recipes_bom` / `inventory_transactions` / `ai_forecasts` / `alerts` / `alert_settings` / `mart_hourly_sales`

### 마이그레이션 적용

```bash
# Supabase CLI로 마이그레이션 실행
supabase db push
```

상세 스키마는 [docs/database.md](docs/database.md) 참조.

---

## 아키텍처

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   Browser   │────▶│  Next.js App Router  │────▶│   Supabase   │
│  (React 19) │     │                      │     │ (PostgreSQL) │
│  Tailwind   │     │  ┌─── API Routes ──┐ │     │  + Auth      │
│  Recharts   │     │  │ /api/ai/*       │─┼──▶  │  + RLS       │
│  Framer     │     │  │ /api/pos/*      │ │     └──────────────┘
│             │     │  │ /api/social/*   │ │
└─────────────┘     │  └────────┬────────┘ │     ┌──────────────┐
                    │           │          │────▶│  Gemini API  │
                    │    Server Only       │     │  (AI Engine)  │
                    └──────────────────────┘     └──────────────┘
```

- **API 키 보호**: Gemini/Facebook API 키는 서버 사이드(API Routes)에서만 사용
- **멀티테넌트**: RLS(Row Level Security)로 매장별 데이터 완전 격리
- **Phase 1**: Mock 데이터로 동작, Supabase 없이도 기능 확인 가능

---

## 개발 Phase

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 1 (MVP)** | 가상 데이터 기반 대시보드, AI 예측, 재고, 마케팅, 채팅 | 진행중 |
| **Phase 2** | 실제 POS 연동, 주문 정규화, 환불 관리 | 예정 |
| **Phase 3** | SNS 마케팅 채널 확장, 채팅 이력 저장 | 예정 |
| **Phase 4** | 레시피 BOM 기반 자동 재고 차감 | 예정 |
| **Phase 5** | AI 예측 이력/정확도 추적, 알림 시스템, 분석 마트 | 예정 |

---

## 문서

- [서비스 기획서](docs/ServicePlan.md)
- [DB 설계서](docs/database.md)
- [개발일지](docs/devlog/README.md)
- [이용약관](docs/terms.md)
- [개인정보처리방침](docs/privacy.md)
