-- ============================================================
-- POS 인사이트 AI - 스키마 고도화
-- ChatGPT 참조 스키마 장점 흡수
-- ============================================================

-- ─────────────────────────────────────────
-- 1. sales_orders + sales_order_items (주문 정규화)
--    기존 sales 테이블은 유지하되, 주문 단위 분석을 위해
--    주문(order) → 주문항목(items) 구조 추가
-- ─────────────────────────────────────────
CREATE TABLE sales_orders (
  order_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id       uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  order_no       text,                                       -- POS 주문번호
  ordered_at     timestamptz NOT NULL DEFAULT now(),
  total_amount   integer NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  payment_method text NOT NULL DEFAULT 'card'
                 CHECK (payment_method IN ('card', 'cash', 'transfer', 'mixed', 'other')),
  payment_status text NOT NULL DEFAULT 'paid'
                 CHECK (payment_status IN ('paid', 'partial', 'refunded', 'cancelled')),
  weather        text,
  temperature    smallint,
  memo           text
);

COMMENT ON TABLE sales_orders IS '주문 단위 매출 기록 (1주문 = N개 메뉴)';

CREATE INDEX idx_orders_store_date ON sales_orders (store_id, ordered_at);

CREATE TABLE sales_order_items (
  order_item_id  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id       bigint NOT NULL REFERENCES sales_orders(order_id) ON DELETE CASCADE,
  menu_id        bigint NOT NULL REFERENCES menus(menu_id) ON DELETE RESTRICT,
  qty            integer NOT NULL CHECK (qty > 0),
  unit_price     integer NOT NULL CHECK (unit_price >= 0),
  subtotal       integer NOT NULL CHECK (subtotal >= 0)      -- qty × unit_price
);

COMMENT ON TABLE sales_order_items IS '주문별 메뉴 항목 (장바구니 분석용)';

CREATE INDEX idx_order_items_order ON sales_order_items (order_id);
CREATE INDEX idx_order_items_menu  ON sales_order_items (menu_id);

-- ─────────────────────────────────────────
-- 2. refunds (환불 기록)
-- ─────────────────────────────────────────
CREATE TABLE refunds (
  refund_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id     bigint NOT NULL REFERENCES sales_orders(order_id) ON DELETE CASCADE,
  amount       integer NOT NULL CHECK (amount > 0),
  reason       text,
  refunded_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE refunds IS '주문 환불 기록';

-- ─────────────────────────────────────────
-- 3. recipes_bom (레시피 / 자재 명세서)
--    메뉴와 재고 품목의 연결
--    예: 아메리카노 1잔 = 원두 18g + 물 200ml
-- ─────────────────────────────────────────
CREATE TABLE recipes_bom (
  bom_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  menu_id   bigint NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
  item_id   bigint NOT NULL REFERENCES inventory(item_id) ON DELETE CASCADE,
  qty       numeric(10, 4) NOT NULL CHECK (qty > 0),          -- 메뉴 1개당 소요량

  UNIQUE (menu_id, item_id)
);

COMMENT ON TABLE recipes_bom IS '메뉴 레시피 (메뉴 1개 제조 시 필요한 재고 품목 및 수량)';

CREATE INDEX idx_bom_menu ON recipes_bom (menu_id);
CREATE INDEX idx_bom_item ON recipes_bom (item_id);

-- ─────────────────────────────────────────
-- 4. inventory_transactions (재고 입출고 이력)
--    모든 재고 변동을 추적
-- ─────────────────────────────────────────
CREATE TABLE inventory_transactions (
  txn_id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id   uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  item_id    bigint NOT NULL REFERENCES inventory(item_id) ON DELETE CASCADE,
  qty_change numeric(10, 2) NOT NULL,                         -- 양수=입고, 음수=출고/소진
  txn_type   text NOT NULL
             CHECK (txn_type IN ('sale', 'purchase', 'adjustment', 'waste', 'return')),
  reference_id text,                                          -- 관련 주문/발주 ID
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE inventory_transactions IS '재고 입출고 이력 (감사 추적용)';

CREATE INDEX idx_inv_txn_store   ON inventory_transactions (store_id, created_at);
CREATE INDEX idx_inv_txn_item    ON inventory_transactions (item_id, created_at);

-- ─────────────────────────────────────────
-- 5. ai_forecasts (AI 예측 이력)
--    Gemini 예측 결과를 저장하여 정확도 검증
-- ─────────────────────────────────────────
CREATE TABLE ai_forecasts (
  forecast_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id       uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  forecast_type  text NOT NULL
                 CHECK (forecast_type IN ('daily_sales', 'product_demand', 'reorder')),
  target_date    date NOT NULL,
  predicted_value numeric NOT NULL,                           -- 예측 매출 or 예측 수량
  actual_value    numeric,                                    -- 실제값 (사후 업데이트)
  accuracy       numeric,                                     -- 정확도 % (사후 계산)
  details        jsonb,                                       -- 상세 예측 데이터 (메뉴별 등)
  model_version  text,                                        -- 사용된 Gemini 모델
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_forecasts IS 'AI 매출/수요 예측 이력 (정확도 검증용)';

CREATE INDEX idx_forecasts_store ON ai_forecasts (store_id, target_date);

-- ─────────────────────────────────────────
-- 6. alerts (알림) + alert_settings (알림 설정)
-- ─────────────────────────────────────────
CREATE TABLE alerts (
  alert_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id   uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  alert_type text NOT NULL
             CHECK (alert_type IN ('low_stock', 'out_of_stock', 'sales_drop', 'sales_peak', 'reorder', 'forecast')),
  severity   text NOT NULL DEFAULT 'warning'
             CHECK (severity IN ('info', 'warning', 'critical')),
  title      text NOT NULL,
  message    text NOT NULL,
  reference_table text,                                       -- 관련 테이블명
  reference_id    text,                                       -- 관련 레코드 ID
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE alerts IS '매장 알림 (재고 부족, 매출 이상 등)';

CREATE INDEX idx_alerts_store    ON alerts (store_id, created_at DESC);
CREATE INDEX idx_alerts_unread   ON alerts (store_id, is_read) WHERE is_read = false;

CREATE TABLE alert_settings (
  setting_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id   uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  channel    text NOT NULL DEFAULT 'in_app'
             CHECK (channel IN ('in_app', 'email', 'kakao', 'push')),
  threshold  jsonb,                                           -- 임계값 설정 (예: {"min_stock": 3})

  UNIQUE (store_id, user_id, alert_type, channel)
);

COMMENT ON TABLE alert_settings IS '사용자별 알림 수신 설정';

-- ─────────────────────────────────────────
-- 7. mart_hourly_sales (시간대별 매출 Mart)
--    대시보드 시간대별 차트 성능 최적화
-- ─────────────────────────────────────────
CREATE TABLE mart_hourly_sales (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id     uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  sales_date   date NOT NULL,
  hour         smallint NOT NULL CHECK (hour BETWEEN 0 AND 23),
  total_sales  integer NOT NULL DEFAULT 0,
  order_count  integer NOT NULL DEFAULT 0,

  UNIQUE (store_id, sales_date, hour)
);

COMMENT ON TABLE mart_hourly_sales IS '시간대별 매출 집계 (차트 성능 최적화)';

CREATE INDEX idx_mart_hourly ON mart_hourly_sales (store_id, sales_date);

-- ─────────────────────────────────────────
-- 8. RLS 정책 (추가 테이블)
-- ─────────────────────────────────────────
ALTER TABLE sales_orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds                ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes_bom            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_forecasts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE mart_hourly_sales      ENABLE ROW LEVEL SECURITY;

-- sales_orders
CREATE POLICY "sales_orders_select" ON sales_orders
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "sales_orders_insert" ON sales_orders
  FOR INSERT WITH CHECK (store_id = get_my_store_id());

-- sales_order_items (주문 기반 접근)
CREATE POLICY "order_items_select" ON sales_order_items
  FOR SELECT USING (
    order_id IN (SELECT order_id FROM sales_orders WHERE store_id = get_my_store_id())
  );
CREATE POLICY "order_items_insert" ON sales_order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT order_id FROM sales_orders WHERE store_id = get_my_store_id())
  );

-- refunds (주문 기반)
CREATE POLICY "refunds_select" ON refunds
  FOR SELECT USING (
    order_id IN (SELECT order_id FROM sales_orders WHERE store_id = get_my_store_id())
  );
CREATE POLICY "refunds_insert" ON refunds
  FOR INSERT WITH CHECK (
    order_id IN (SELECT order_id FROM sales_orders WHERE store_id = get_my_store_id())
  );

-- recipes_bom (메뉴 기반)
CREATE POLICY "bom_select" ON recipes_bom
  FOR SELECT USING (
    menu_id IN (SELECT menu_id FROM menus WHERE store_id = get_my_store_id())
  );
CREATE POLICY "bom_insert" ON recipes_bom
  FOR INSERT WITH CHECK (
    menu_id IN (SELECT menu_id FROM menus WHERE store_id = get_my_store_id())
  );
CREATE POLICY "bom_update" ON recipes_bom
  FOR UPDATE USING (
    menu_id IN (SELECT menu_id FROM menus WHERE store_id = get_my_store_id())
  );
CREATE POLICY "bom_delete" ON recipes_bom
  FOR DELETE USING (
    menu_id IN (SELECT menu_id FROM menus WHERE store_id = get_my_store_id())
  );

-- inventory_transactions
CREATE POLICY "inv_txn_select" ON inventory_transactions
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "inv_txn_insert" ON inventory_transactions
  FOR INSERT WITH CHECK (store_id = get_my_store_id());

-- ai_forecasts
CREATE POLICY "forecasts_select" ON ai_forecasts
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "forecasts_insert" ON ai_forecasts
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "forecasts_update" ON ai_forecasts
  FOR UPDATE USING (store_id = get_my_store_id());

-- alerts
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "alerts_update" ON alerts
  FOR UPDATE USING (store_id = get_my_store_id());

-- alert_settings
CREATE POLICY "alert_settings_select" ON alert_settings
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "alert_settings_insert" ON alert_settings
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "alert_settings_update" ON alert_settings
  FOR UPDATE USING (store_id = get_my_store_id());
CREATE POLICY "alert_settings_delete" ON alert_settings
  FOR DELETE USING (store_id = get_my_store_id());

-- mart_hourly_sales
CREATE POLICY "mart_hourly_select" ON mart_hourly_sales
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "mart_hourly_insert" ON mart_hourly_sales
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "mart_hourly_update" ON mart_hourly_sales
  FOR UPDATE USING (store_id = get_my_store_id());
