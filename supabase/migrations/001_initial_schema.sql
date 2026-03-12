-- ============================================================
-- POS 인사이트 AI - 초기 DB 스키마
-- Supabase (PostgreSQL)
-- ============================================================

-- ─────────────────────────────────────────
-- 1. stores (매장 / 테넌트)
-- ─────────────────────────────────────────
CREATE TABLE stores (
  store_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  business_type text,
  phone       text,
  address     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE stores IS '매장 정보 (B2B 멀티테넌트 단위)';

-- ─────────────────────────────────────────
-- 2. profiles (사용자 프로필)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id     uuid REFERENCES stores(store_id) ON DELETE SET NULL,
  display_name text,
  role         text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS '사용자 프로필 (auth.users 확장)';

-- 회원가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────
-- 3. menus (메뉴 / 상품)
-- ─────────────────────────────────────────
CREATE TABLE menus (
  menu_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id   uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  name       text NOT NULL,
  category   text NOT NULL,
  price      integer NOT NULL CHECK (price >= 0),
  cost_price integer NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  is_active  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE menus IS '매장 판매 메뉴/상품 목록';

CREATE INDEX idx_menus_store ON menus (store_id);

-- ─────────────────────────────────────────
-- 4. sales (매출 트랜잭션)
-- ─────────────────────────────────────────
CREATE TABLE sales (
  sale_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id       uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  menu_id        bigint NOT NULL REFERENCES menus(menu_id) ON DELETE RESTRICT,
  sold_at        timestamptz NOT NULL DEFAULT now(),
  qty            integer NOT NULL CHECK (qty > 0),
  unit_price     integer NOT NULL CHECK (unit_price >= 0),
  total_amount   integer NOT NULL CHECK (total_amount >= 0),
  payment_method text NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'cash', 'transfer', 'other')),
  weather        text,
  temperature    smallint
);

COMMENT ON TABLE sales IS 'POS 매출 기록 (핵심 트랜잭션)';

-- 성능 핵심 인덱스
CREATE INDEX idx_sales_store_date ON sales (store_id, sold_at);
CREATE INDEX idx_sales_store_menu ON sales (store_id, menu_id);

-- ─────────────────────────────────────────
-- 5. inventory (재고)
-- ─────────────────────────────────────────
CREATE TABLE inventory (
  item_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id     uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  name         text NOT NULL,
  stock_qty    numeric(10, 2) NOT NULL DEFAULT 0,
  unit         text NOT NULL,
  safety_stock numeric(10, 2) NOT NULL DEFAULT 5,
  status       text GENERATED ALWAYS AS (
    CASE
      WHEN stock_qty <= 0 THEN 'out_of_stock'
      WHEN stock_qty < safety_stock THEN 'low'
      ELSE 'normal'
    END
  ) STORED,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE inventory IS '매장 재고 현황';

CREATE INDEX idx_inventory_store ON inventory (store_id);
CREATE INDEX idx_inventory_status ON inventory (store_id, status);

-- ─────────────────────────────────────────
-- 6. purchase_orders (발주)
-- ─────────────────────────────────────────
CREATE TABLE purchase_orders (
  order_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id    uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  item_id     bigint NOT NULL REFERENCES inventory(item_id) ON DELETE RESTRICT,
  qty         numeric(10, 2) NOT NULL CHECK (qty > 0),
  unit_price  integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  supplier    text,
  ordered_at  timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz
);

COMMENT ON TABLE purchase_orders IS '재고 발주 기록';

CREATE INDEX idx_orders_store ON purchase_orders (store_id, ordered_at);

-- ─────────────────────────────────────────
-- 7. daily_summary (일별 매출 집계 캐시)
-- ─────────────────────────────────────────
CREATE TABLE daily_summary (
  summary_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id     uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  summary_date date NOT NULL,
  total_sales  integer NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  total_qty    integer NOT NULL DEFAULT 0,
  avg_ticket   integer NOT NULL DEFAULT 0,
  top_menu_id  bigint REFERENCES menus(menu_id) ON DELETE SET NULL,
  weather      text,
  temperature  smallint,

  UNIQUE (store_id, summary_date)
);

COMMENT ON TABLE daily_summary IS '대시보드 성능 최적화를 위한 일별 집계';

CREATE INDEX idx_summary_store_date ON daily_summary (store_id, summary_date);

-- ─────────────────────────────────────────
-- 8. social_accounts (SNS 연동)
-- ─────────────────────────────────────────
CREATE TABLE social_accounts (
  account_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id      uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  platform      text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'kakao')),
  access_token  text,
  refresh_token text,
  page_id       text,
  page_name     text,
  connected_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,

  UNIQUE (store_id, platform)
);

COMMENT ON TABLE social_accounts IS 'SNS 플랫폼 연결 정보';

-- ─────────────────────────────────────────
-- 9. marketing_posts (마케팅 게시물)
-- ─────────────────────────────────────────
CREATE TABLE marketing_posts (
  post_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id         uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  user_id          uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  platform         text NOT NULL,
  content          text NOT NULL,
  media_url        text,
  topic            text,
  status           text NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'published', 'failed')),
  external_post_id text,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE marketing_posts IS 'AI 생성 마케팅 콘텐츠 및 게시 기록';

CREATE INDEX idx_posts_store ON marketing_posts (store_id, created_at DESC);

-- ─────────────────────────────────────────
-- 10. chat_sessions / chat_messages (AI 채팅)
-- ─────────────────────────────────────────
CREATE TABLE chat_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title      text NOT NULL DEFAULT '새 대화',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE chat_sessions IS 'AI 경영 비서 채팅 세션';

CREATE INDEX idx_sessions_store ON chat_sessions (store_id, user_id);

CREATE TABLE chat_messages (
  message_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user', 'ai')),
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE chat_messages IS 'AI 채팅 메시지 기록';

CREATE INDEX idx_messages_session ON chat_messages (session_id, created_at);

-- ─────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
