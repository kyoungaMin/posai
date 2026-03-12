# POS 인사이트 AI - 데이터베이스 설계서

**DB:** Supabase (PostgreSQL)
**설계일:** 2026-03-12
**버전:** 2.0 (고도화 스키마 포함)

---

## ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   stores     │       │     profiles     │       │  social_accounts │
│──────────────│       │──────────────────│       │──────────────────│
│ PK store_id  │◄──┐   │ PK user_id (FK)  │──┐    │ PK account_id   │
│    name      │   │   │ FK store_id      │──┘    │ FK store_id      │
│    business  │   │   │    display_name  │       │    platform      │
│    phone     │   │   │    role          │       │    access_token  │
│    address   │   │   │    avatar_url    │       │    page_id       │
│    created   │   │   │    created       │       │    connected_at  │
└──────┬───────┘   │   └──────────────────┘       └──────────────────┘
       │           │
       │ 1:N       │ 1:N
       ▼           │
┌──────────────┐   │   ┌──────────────────┐
│   menus      │   │   │   inventory      │
│──────────────│   │   │──────────────────│
│ PK menu_id   │   │   │ PK item_id       │
│ FK store_id  │───┘   │ FK store_id      │───┐
│    name      │       │    name          │   │
│    category  │       │    stock_qty     │   │
│    price     │       │    unit          │   │
│    is_active │       │    safety_stock  │   │
│    created   │       │    status        │   │
└──────┬───────┘       │    updated       │   │
       │               └──────┬───────────┘   │
       │ 1:N                  │ 1:N           │
       ▼                      ▼               │
┌──────────────────┐   ┌──────────────────┐   │
│     sales        │   │  purchase_orders │   │
│──────────────────│   │──────────────────│   │
│ PK sale_id       │   │ PK order_id      │   │
│ FK store_id      │   │ FK store_id      │   │
│ FK menu_id       │   │ FK item_id       │───┘
│    sold_at       │   │    qty           │
│    qty           │   │    unit_price    │
│    unit_price    │   │    total_price   │
│    total_amount  │   │    status        │
│    payment       │   │    supplier      │
│    weather       │   │    ordered_at    │
│    temperature   │   │    received_at   │
└──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐
│ marketing_posts  │   │  chat_sessions   │
│──────────────────│   │──────────────────│
│ PK post_id       │   │ PK session_id    │
│ FK store_id      │   │ FK store_id      │
│ FK user_id       │   │ FK user_id       │
│    platform      │   │    created_at    │
│    content       │   │    title         │
│    media_url     │   └────────┬─────────┘
│    status        │            │ 1:N
│    external_id   │            ▼
│    topic         │   ┌──────────────────┐
│    published_at  │   │  chat_messages   │
│    created_at    │   │──────────────────│
└──────────────────┘   │ PK message_id    │
                       │ FK session_id    │
                       │    role          │
                       │    content       │
                       │    created_at    │
                       └──────────────────┘

┌──────────────────┐
│  daily_summary   │  (Materialized / 집계 캐시)
│──────────────────│
│ PK summary_id    │
│ FK store_id      │
│    summary_date  │
│    total_sales   │
│    total_orders  │
│    total_qty     │
│    avg_ticket    │
│    top_menu_id   │
│    weather       │
│    temperature   │
└──────────────────┘

── 고도화 테이블 (004_enhanced_schema) ──────────────────────────

┌──────────────────┐       ┌──────────────────┐
│  sales_orders    │       │ sales_order_items │
│──────────────────│       │──────────────────│
│ PK order_id      │◄──┐   │ PK order_item_id │
│ FK store_id      │   │   │ FK order_id      │───┘
│    order_no      │   │   │ FK menu_id       │
│    ordered_at    │   │   │    qty           │
│    total_amount  │   │   │    unit_price    │
│    payment_method│   │   │    subtotal      │
│    payment_status│   │   └──────────────────┘
│    weather       │   │
│    memo          │   │   ┌──────────────────┐
└──────────────────┘   │   │    refunds       │
                       │   │──────────────────│
                       │   │ PK refund_id     │
                       └───│ FK order_id      │
                           │    amount        │
                           │    reason        │
                           │    refunded_at   │
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────────┐
│  recipes_bom     │       │ inventory_transactions│
│──────────────────│       │──────────────────────│
│ PK bom_id        │       │ PK txn_id            │
│ FK menu_id       │       │ FK store_id           │
│ FK item_id       │       │ FK item_id            │
│    qty           │       │    qty_change         │
└──────────────────┘       │    txn_type           │
                           │    reference_id       │
                           │    note               │
                           │    created_at         │
                           └──────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│  ai_forecasts    │       │     alerts       │
│──────────────────│       │──────────────────│
│ PK forecast_id   │       │ PK alert_id      │
│ FK store_id      │       │ FK store_id      │
│    forecast_type │       │    alert_type    │
│    target_date   │       │    severity      │
│    predicted     │       │    title         │
│    actual        │       │    message       │
│    accuracy      │       │    is_read       │
│    details       │       │    created_at    │
│    model_version │       └──────────────────┘
│    created_at    │
└──────────────────┘       ┌──────────────────┐
                           │  alert_settings  │
┌──────────────────┐       │──────────────────│
│ mart_hourly_sales│       │ PK setting_id    │
│──────────────────│       │ FK store_id      │
│ PK id            │       │ FK user_id       │
│ FK store_id      │       │    alert_type    │
│    sales_date    │       │    is_enabled    │
│    hour          │       │    channel       │
│    total_sales   │       │    threshold     │
│    order_count   │       └──────────────────┘
└──────────────────┘
```

---

## 테이블 상세

### 1. `stores` - 매장 (테넌트)
B2B SaaS의 핵심. 모든 데이터는 `store_id`로 격리됩니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `store_id` | `uuid` | PK, DEFAULT gen_random_uuid() | 매장 고유 ID |
| `name` | `text` | NOT NULL | 매장명 (예: 대박카페) |
| `business_type` | `text` | | 업종 (카페, 음식점, 편의점 등) |
| `phone` | `text` | | 연락처 |
| `address` | `text` | | 매장 주소 |
| `created_at` | `timestamptz` | DEFAULT now() | 생성일 |
| `updated_at` | `timestamptz` | DEFAULT now() | 수정일 |

### 2. `profiles` - 사용자 프로필
Supabase Auth의 `auth.users`와 1:1 연결됩니다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `user_id` | `uuid` | PK, FK → auth.users(id) | Supabase Auth 사용자 ID |
| `store_id` | `uuid` | FK → stores | 소속 매장 |
| `display_name` | `text` | | 표시 이름 |
| `role` | `text` | DEFAULT 'owner' | 역할 (owner, manager, staff) |
| `avatar_url` | `text` | | 프로필 이미지 |
| `created_at` | `timestamptz` | DEFAULT now() | 가입일 |

### 3. `menus` - 메뉴/상품
매장에서 판매하는 메뉴 목록.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `menu_id` | `bigint` | PK, GENERATED ALWAYS | 메뉴 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 소속 매장 |
| `name` | `text` | NOT NULL | 메뉴명 |
| `category` | `text` | NOT NULL | 카테고리 (커피, 디저트 등) |
| `price` | `integer` | NOT NULL, CHECK (>= 0) | 판매가 (원) |
| `cost_price` | `integer` | DEFAULT 0 | 원가 (원) |
| `is_active` | `boolean` | DEFAULT true | 판매 중 여부 |
| `sort_order` | `integer` | DEFAULT 0 | 정렬 순서 |
| `created_at` | `timestamptz` | DEFAULT now() | 등록일 |

### 4. `sales` - 매출 (트랜잭션)
핵심 데이터. POS에서 발생하는 모든 판매 기록.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `sale_id` | `bigint` | PK, GENERATED ALWAYS | 판매 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `menu_id` | `bigint` | FK → menus, NOT NULL | 판매 메뉴 |
| `sold_at` | `timestamptz` | NOT NULL, DEFAULT now() | 판매 시각 |
| `qty` | `integer` | NOT NULL, CHECK (> 0) | 수량 |
| `unit_price` | `integer` | NOT NULL | 개당 단가 |
| `total_amount` | `integer` | NOT NULL | 총액 (qty × unit_price) |
| `payment_method` | `text` | DEFAULT 'card' | 결제수단 (card, cash, etc.) |
| `weather` | `text` | | 당시 날씨 |
| `temperature` | `smallint` | | 당시 기온 (°C) |

> **인덱스:** `(store_id, sold_at)` - 매장별 날짜 범위 조회 최적화

### 5. `inventory` - 재고
식자재 및 소모품의 현재 재고 상태.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `item_id` | `bigint` | PK, GENERATED ALWAYS | 품목 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `name` | `text` | NOT NULL | 품목명 |
| `stock_qty` | `numeric(10,2)` | NOT NULL, DEFAULT 0 | 현재 재고량 |
| `unit` | `text` | NOT NULL | 단위 (L, kg, 개 등) |
| `safety_stock` | `numeric(10,2)` | DEFAULT 5 | 안전 재고 기준 |
| `status` | `text` | GENERATED (계산) | 상태 (정상/경고/부족) |
| `updated_at` | `timestamptz` | DEFAULT now() | 최종 수정일 |

### 6. `purchase_orders` - 발주
재고 보충을 위한 발주 기록.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `order_id` | `bigint` | PK, GENERATED ALWAYS | 발주 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `item_id` | `bigint` | FK → inventory, NOT NULL | 발주 품목 |
| `qty` | `numeric(10,2)` | NOT NULL | 발주 수량 |
| `unit_price` | `integer` | DEFAULT 0 | 단가 |
| `total_price` | `integer` | DEFAULT 0 | 합계 |
| `status` | `text` | DEFAULT 'pending' | 상태 (pending/ordered/received/cancelled) |
| `supplier` | `text` | | 공급업체 |
| `ordered_at` | `timestamptz` | DEFAULT now() | 발주일 |
| `received_at` | `timestamptz` | | 입고일 |

### 7. `marketing_posts` - 마케팅 게시물
AI로 생성한 홍보 콘텐츠 및 SNS 게시 기록.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `post_id` | `bigint` | PK, GENERATED ALWAYS | 게시물 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `user_id` | `uuid` | FK → profiles | 작성자 |
| `platform` | `text` | NOT NULL | 플랫폼 (facebook, instagram, kakao) |
| `content` | `text` | NOT NULL | 게시 내용 |
| `media_url` | `text` | | 첨부 미디어 URL (Supabase Storage) |
| `topic` | `text` | | 홍보 주제 |
| `status` | `text` | DEFAULT 'draft' | 상태 (draft/published/failed) |
| `external_post_id` | `text` | | SNS 플랫폼 게시물 ID |
| `published_at` | `timestamptz` | | 게시 시각 |
| `created_at` | `timestamptz` | DEFAULT now() | 생성일 |

### 8. `social_accounts` - SNS 연동 계정
매장의 소셜 미디어 연결 정보.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `account_id` | `bigint` | PK, GENERATED ALWAYS | 계정 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `platform` | `text` | NOT NULL | 플랫폼명 |
| `access_token` | `text` | | 암호화된 액세스 토큰 |
| `refresh_token` | `text` | | 리프레시 토큰 |
| `page_id` | `text` | | 페이지/계정 ID |
| `page_name` | `text` | | 페이지/계정 이름 |
| `connected_at` | `timestamptz` | DEFAULT now() | 연결일 |
| `expires_at` | `timestamptz` | | 토큰 만료일 |

### 9. `chat_sessions` / `chat_messages` - AI 채팅
AI 경영 비서와의 대화 기록.

**chat_sessions:**

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `session_id` | `uuid` | PK, DEFAULT gen_random_uuid() | 세션 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `user_id` | `uuid` | FK → profiles, NOT NULL | 사용자 |
| `title` | `text` | DEFAULT '새 대화' | 대화 제목 |
| `created_at` | `timestamptz` | DEFAULT now() | 시작일 |

**chat_messages:**

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `message_id` | `bigint` | PK, GENERATED ALWAYS | 메시지 ID |
| `session_id` | `uuid` | FK → chat_sessions, NOT NULL | 세션 |
| `role` | `text` | NOT NULL, CHECK (user/ai) | 발신자 |
| `content` | `text` | NOT NULL | 메시지 내용 |
| `created_at` | `timestamptz` | DEFAULT now() | 발송 시각 |

### 10. `daily_summary` - 일별 매출 요약 (집계 캐시)
대시보드 성능 최적화를 위한 일별 집계 테이블.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `summary_id` | `bigint` | PK, GENERATED ALWAYS | ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `summary_date` | `date` | NOT NULL | 집계 날짜 |
| `total_sales` | `integer` | DEFAULT 0 | 총 매출 |
| `total_orders` | `integer` | DEFAULT 0 | 총 주문 수 |
| `total_qty` | `integer` | DEFAULT 0 | 총 판매 수량 |
| `avg_ticket` | `integer` | DEFAULT 0 | 평균 객단가 |
| `top_menu_id` | `bigint` | FK → menus | 최다 판매 메뉴 |
| `weather` | `text` | | 날씨 |
| `temperature` | `smallint` | | 기온 |

> **UNIQUE:** `(store_id, summary_date)` - 매장별 하루 1행

---

## 고도화 테이블 (004_enhanced_schema)

### 11. `sales_orders` - 주문 (정규화)
기존 `sales` 테이블의 주문 단위 정규화. 주문 1건에 여러 메뉴를 포함.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `order_id` | `bigint` | PK, GENERATED ALWAYS | 주문 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `order_no` | `text` | UNIQUE | POS 주문번호 |
| `ordered_at` | `timestamptz` | DEFAULT now() | 주문 시각 |
| `total_amount` | `integer` | NOT NULL, DEFAULT 0 | 총 결제 금액 |
| `payment_method` | `text` | DEFAULT 'card' | 결제수단 (card/cash/transfer/mixed/other) |
| `payment_status` | `text` | DEFAULT 'paid' | 결제상태 (paid/partial/refunded/cancelled) |
| `weather` | `text` | | 날씨 |
| `temperature` | `smallint` | | 기온 |
| `memo` | `text` | | 메모 |

### 12. `sales_order_items` - 주문 항목
주문 내 개별 메뉴 항목.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `order_item_id` | `bigint` | PK, GENERATED ALWAYS | 항목 ID |
| `order_id` | `bigint` | FK → sales_orders, NOT NULL | 주문 |
| `menu_id` | `bigint` | FK → menus, NOT NULL | 메뉴 |
| `qty` | `integer` | NOT NULL, CHECK (> 0) | 수량 |
| `unit_price` | `integer` | NOT NULL | 단가 |
| `subtotal` | `integer` | NOT NULL | 소계 (qty × unit_price) |

### 13. `refunds` - 환불
주문 단위 환불 기록.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `refund_id` | `bigint` | PK, GENERATED ALWAYS | 환불 ID |
| `order_id` | `bigint` | FK → sales_orders, NOT NULL | 원 주문 |
| `amount` | `integer` | NOT NULL, CHECK (> 0) | 환불 금액 |
| `reason` | `text` | | 환불 사유 |
| `refunded_at` | `timestamptz` | DEFAULT now() | 환불 시각 |

### 14. `recipes_bom` - 레시피 BOM (Bill of Materials)
메뉴와 재고 품목 간의 소요량 매핑. 판매 시 자동 재고 차감의 기반.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `bom_id` | `bigint` | PK, GENERATED ALWAYS | BOM ID |
| `menu_id` | `bigint` | FK → menus, NOT NULL | 메뉴 |
| `item_id` | `bigint` | FK → inventory, NOT NULL | 재고 품목 |
| `qty` | `numeric(10,4)` | NOT NULL | 1회 소요량 |

> **UNIQUE:** `(menu_id, item_id)` - 메뉴당 품목 중복 방지

### 15. `inventory_transactions` - 재고 이력
모든 재고 변동을 추적하는 트랜잭션 로그.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `txn_id` | `bigint` | PK, GENERATED ALWAYS | 트랜잭션 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `item_id` | `bigint` | FK → inventory, NOT NULL | 품목 |
| `qty_change` | `numeric(10,2)` | NOT NULL | 변동량 (+입고, -출고) |
| `txn_type` | `text` | NOT NULL | 유형 (sale/purchase/adjustment/waste/return) |
| `reference_id` | `text` | | 참조 ID (주문번호 등) |
| `note` | `text` | | 비고 |
| `created_at` | `timestamptz` | DEFAULT now() | 발생 시각 |

### 16. `ai_forecasts` - AI 예측 이력
AI 모델의 예측 결과 및 정확도 추적.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `forecast_id` | `bigint` | PK, GENERATED ALWAYS | 예측 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `forecast_type` | `text` | NOT NULL | 유형 (daily_sales/product_demand/reorder) |
| `target_date` | `date` | NOT NULL | 예측 대상일 |
| `predicted_value` | `numeric(12,2)` | NOT NULL | 예측값 |
| `actual_value` | `numeric(12,2)` | | 실제값 (사후 기록) |
| `accuracy` | `numeric(5,2)` | | 정확도 (%) |
| `details` | `jsonb` | | 상세 데이터 (메뉴별 등) |
| `model_version` | `text` | | 모델 버전 |
| `created_at` | `timestamptz` | DEFAULT now() | 예측 생성일 |

### 17. `alerts` - 알림
시스템이 자동 생성하는 경영 알림.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `alert_id` | `bigint` | PK, GENERATED ALWAYS | 알림 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `alert_type` | `text` | NOT NULL | 유형 (low_stock/out_of_stock/sales_drop/sales_peak/reorder/forecast) |
| `severity` | `text` | DEFAULT 'info' | 심각도 (info/warning/critical) |
| `title` | `text` | NOT NULL | 알림 제목 |
| `message` | `text` | NOT NULL | 알림 내용 |
| `reference_table` | `text` | | 참조 테이블명 |
| `reference_id` | `text` | | 참조 레코드 ID |
| `is_read` | `boolean` | DEFAULT false | 읽음 여부 |
| `created_at` | `timestamptz` | DEFAULT now() | 생성 시각 |

### 18. `alert_settings` - 알림 설정
사용자별 알림 수신 환경 설정.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `setting_id` | `bigint` | PK, GENERATED ALWAYS | 설정 ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `user_id` | `uuid` | FK → profiles, NOT NULL | 사용자 |
| `alert_type` | `text` | NOT NULL | 알림 유형 |
| `is_enabled` | `boolean` | DEFAULT true | 활성화 여부 |
| `channel` | `text` | DEFAULT 'in_app' | 채널 (in_app/email/kakao/push) |
| `threshold` | `jsonb` | | 임계값 설정 |

### 19. `mart_hourly_sales` - 시간대별 매출 마트
대시보드 시간대 분석을 위한 사전 집계 테이블.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `bigint` | PK, GENERATED ALWAYS | ID |
| `store_id` | `uuid` | FK → stores, NOT NULL | 매장 |
| `sales_date` | `date` | NOT NULL | 날짜 |
| `hour` | `smallint` | NOT NULL, CHECK (0-23) | 시간대 |
| `total_sales` | `integer` | DEFAULT 0 | 해당 시간 매출 |
| `order_count` | `integer` | DEFAULT 0 | 해당 시간 주문 수 |

> **UNIQUE:** `(store_id, sales_date, hour)` - 매장/날짜/시간 1행

---

## RLS (Row Level Security) 정책

Supabase의 RLS로 **멀티테넌트 데이터 격리**를 구현합니다.

```sql
-- 모든 테이블에 적용할 기본 정책 패턴:
-- "사용자는 자신의 매장 데이터만 조회/수정 가능"

CREATE POLICY "store_isolation" ON [테이블]
  USING (store_id = (
    SELECT store_id FROM profiles WHERE user_id = auth.uid()
  ));
```

---

## 주요 인덱스

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| `sales` | `(store_id, sold_at)` | 기간별 매출 조회 |
| `sales` | `(store_id, menu_id)` | 메뉴별 판매 집계 |
| `inventory` | `(store_id, status)` | 재고 부족 알림 조회 |
| `daily_summary` | `(store_id, summary_date)` | 대시보드 차트 |
| `chat_messages` | `(session_id, created_at)` | 채팅 기록 로드 |
| `sales_orders` | `(store_id, ordered_at)` | 주문 기간 조회 |
| `sales_order_items` | `(order_id)` | 주문별 항목 |
| `inventory_transactions` | `(store_id, created_at)` | 재고 이력 조회 |
| `ai_forecasts` | `(store_id, target_date)` | 예측 조회 |
| `alerts` | `(store_id, is_read, created_at)` | 미읽은 알림 조회 |
| `mart_hourly_sales` | `(store_id, sales_date)` | 시간대 분석 |

---

## Phase별 적용 계획

| Phase | 테이블 | 비고 |
|-------|--------|------|
| **Phase 1 (MVP)** | stores, profiles, menus, sales, inventory, daily_summary | 가상 데이터 시딩 |
| **Phase 2** | purchase_orders, sales_orders, sales_order_items, refunds | 실제 POS 연동 + 주문 정규화 |
| **Phase 3** | marketing_posts, social_accounts, chat_sessions, chat_messages | SNS 마케팅 + 채팅 이력 저장 |
| **Phase 4** | recipes_bom, inventory_transactions | 레시피 기반 자동 재고 차감 |
| **Phase 5** | ai_forecasts, alerts, alert_settings, mart_hourly_sales | AI 예측 이력 + 알림 시스템 + 분석 마트 |
