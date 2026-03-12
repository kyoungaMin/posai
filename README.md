# POS 인사이트 AI (POS Insight AI)

소상공인을 위한 **AI 기반 POS 데이터 분석 & 경영 자동화 SaaS**

POS 매출 데이터를 AI가 분석하여 실시간 인사이트, 수요 예측, 재고 관리, SNS 마케팅 자동화까지 한 번에 제공합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **대시보드** | 실시간 매출/주문/객단가 지표, 시간대별·요일별 차트, 상품 랭킹 |
| **AI 매출 예측** | Gemini AI 기반 일별/주간 매출 예측, 날씨 연동, 음성 듣기(TTS) |
| **재고 관리** | 간편 입고/출고, 입출고 이력 추적, 안전재고 설정 & AI 추천 |
| **AI 마케팅** | SNS 홍보 문구 자동 생성 (Facebook/Instagram/카카오) |
| **AI 경영 비서** | 매장 데이터 기반 1:1 채팅 컨설팅 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript 5.8 |
| **Database & Auth** | Supabase (PostgreSQL + Auth + RLS + SSR) |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) |
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
│   │   ├── inventory/               # 재고 컴포넌트 (Table, StockModal, TransactionHistory, AddItemModal)
│   │   └── chat/                    # 채팅 컴포넌트
│   │
│   ├── hooks/                       # 커스텀 훅 (useAuth, usePOSData)
│   ├── lib/                         # 유틸리티 & 클라이언트
│   │   ├── supabase/
│   │   │   ├── client.ts            # 클라이언트 Supabase
│   │   │   ├── server.ts            # 서버 전용 Supabase (쿠키 기반)
│   │   │   ├── middleware.ts        # 세션 갱신 미들웨어
│   │   │   └── queries.ts           # 중앙 쿼리 레이어
│   │   ├── gemini/client.ts         # Gemini AI (서버 전용)
│   │   ├── weather/client.ts        # OpenWeatherMap 연동
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
│       ├── 005_seed_bom.sql         # 레시피 BOM 시드
│       └── 006_weather_forecasts.sql # 날씨 예보 캐시
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
| `OPENWEATHERMAP_API_KEY` | - | OpenWeatherMap API 키 (날씨 예보) |
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
- **날씨 연동**: OpenWeatherMap 예보를 DB에 캐싱, AI 매출 예측에 활용
- **TTS**: Web Speech API로 AI 예측 결과 음성 재생 (한국어)

---

## 구현 계획 (Implementation Plan)

Mock → 실서비스 전환을 위한 단계별 구현 로드맵입니다.

| Step | 내용 | 주요 작업 | 상태 |
|------|------|-----------|------|
| **Step 1** | Supabase 인증 연동 | useAuth → Supabase Auth, 로그인/회원가입 실동작, 보호 라우트 미들웨어 | 완료 |
| **Step 2** | 데이터 레이어 구축 | Supabase 쿼리 함수, API Routes Mock→Supabase 교체 (dashboard, analytics, inventory) | 완료 |
| **Step 3** | 매장 연동 흐름 | 회원가입→매장 생성→store_id 연결, 하드코딩 제거, RLS 기반 필터 | 완료 |
| **Step 4** | AI 실데이터 연동 | Gemini 컨텍스트를 실데이터로, 예측→ai_forecasts 저장, 날씨 예보 연동 | 완료 |
| **Step 5** | 재고관리 실시간화 | 간편 입출고, inventory_transactions 이력, 안전재고 편집 & AI 추천 | 완료 |
| **Step 6** | 마케팅 연동 | Facebook OAuth, marketing_posts 저장, social_accounts 토큰 관리 | 예정 |

### DB Phase (스키마 확장)

| Phase | 테이블 | 비고 |
|-------|--------|------|
| **Phase 1 (MVP)** | stores, profiles, menus, sales, inventory, daily_summary | 완료 (시드 데이터 포함) |
| **Phase 2** | purchase_orders, sales_orders, sales_order_items, refunds | 실제 POS 연동 + 주문 정규화 |
| **Phase 3** | marketing_posts, social_accounts, chat_sessions, chat_messages | SNS 마케팅 + 채팅 이력 저장 |
| **Phase 4** | recipes_bom, inventory_transactions | 레시피 기반 자동 재고 차감 |
| **Phase 5** | ai_forecasts, alerts, alert_settings, mart_hourly_sales | AI 예측 이력 + 알림 시스템 + 분석 마트 |

---

## 문서

- [서비스 기획서](docs/ServicePlan.md)
- [DB 설계서](docs/database.md)
- [개발일지](docs/devlog/README.md)
- [이용약관](docs/terms.md)
- [개인정보처리방침](docs/privacy.md)
