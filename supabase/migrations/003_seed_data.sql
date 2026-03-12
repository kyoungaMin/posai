-- ============================================================
-- POS 인사이트 AI - Phase 1 MVP 시드 데이터
-- 데모/개발용 가상 데이터
-- ============================================================

-- 데모 매장 생성
INSERT INTO stores (store_id, name, business_type, phone, address)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '대박카페',
  '카페',
  '02-1234-5678',
  '서울시 강남구 테헤란로 123'
);

-- 메뉴 등록
INSERT INTO menus (store_id, name, category, price, cost_price) VALUES
  ('00000000-0000-0000-0000-000000000001', '아메리카노',   '커피',     4500, 800),
  ('00000000-0000-0000-0000-000000000001', '카페라떼',     '커피',     5000, 1200),
  ('00000000-0000-0000-0000-000000000001', '바닐라라떼',   '커피',     5500, 1500),
  ('00000000-0000-0000-0000-000000000001', '카라멜프라페', '블렌디드', 6000, 1800),
  ('00000000-0000-0000-0000-000000000001', '치즈케이크',   '디저트',   7000, 3000),
  ('00000000-0000-0000-0000-000000000001', '크루아상',     '디저트',   3500, 1500);

-- 재고 등록
INSERT INTO inventory (store_id, name, stock_qty, unit, safety_stock) VALUES
  ('00000000-0000-0000-0000-000000000001', '우유',           20, 'L',  5),
  ('00000000-0000-0000-0000-000000000001', '에스프레소 원두',  5, 'kg', 3),
  ('00000000-0000-0000-0000-000000000001', '치즈케이크',     10, '개', 3),
  ('00000000-0000-0000-0000-000000000001', '바닐라 시럽',     2, 'L',  2),
  ('00000000-0000-0000-0000-000000000001', '크루아상',       15, '개', 5),
  ('00000000-0000-0000-0000-000000000001', '캐러멜 소스',     3, 'L',  2),
  ('00000000-0000-0000-0000-000000000001', '종이컵 (대)',   200, '개', 50),
  ('00000000-0000-0000-0000-000000000001', '빨대',         300, '개', 100);

-- ─────────────────────────────────────────
-- 30일치 가상 매출 데이터 생성 (PL/pgSQL)
-- ─────────────────────────────────────────
DO $$
DECLARE
  v_store_id  uuid := '00000000-0000-0000-0000-000000000001';
  v_date      date;
  v_menu_id   bigint;
  v_price     integer;
  v_qty       integer;
  v_hour      integer;
  v_sold_at   timestamptz;
  v_weather   text;
  v_temp      smallint;
  v_weathers  text[] := ARRAY['맑음', '흐림', '비', '눈'];
  v_txn_count integer;
  v_menu_ids  bigint[];
  v_prices    integer[];
BEGIN
  -- 메뉴 ID와 가격 배열 준비
  SELECT array_agg(menu_id ORDER BY menu_id), array_agg(price ORDER BY menu_id)
    INTO v_menu_ids, v_prices
    FROM menus WHERE store_id = v_store_id;

  -- 최근 30일 반복
  FOR d IN 0..30 LOOP
    v_date := CURRENT_DATE - d;
    v_weather := v_weathers[1 + floor(random() * 4)::int];
    v_temp := CASE v_weather
      WHEN '눈' THEN (-5 + floor(random() * 10))::smallint
      ELSE (5 + floor(random() * 25))::smallint
    END;

    -- 하루 30~50건 거래
    v_txn_count := 30 + floor(random() * 21)::int;

    FOR t IN 1..v_txn_count LOOP
      -- 랜덤 메뉴 선택 (1~6)
      v_menu_id := v_menu_ids[1 + floor(random() * array_length(v_menu_ids, 1))::int];
      v_price   := v_prices[1 + floor(random() * array_length(v_prices, 1))::int];
      v_qty     := 1 + floor(random() * 2)::int;
      v_hour    := 8 + floor(random() * 12)::int;  -- 8시~19시
      v_sold_at := v_date + (v_hour || ' hours')::interval + (floor(random() * 60) || ' minutes')::interval;

      INSERT INTO sales (store_id, menu_id, sold_at, qty, unit_price, total_amount, payment_method, weather, temperature)
      VALUES (
        v_store_id,
        v_menu_id,
        v_sold_at,
        v_qty,
        v_price,
        v_qty * v_price,
        CASE WHEN random() > 0.3 THEN 'card' ELSE 'cash' END,
        v_weather,
        v_temp
      );
    END LOOP;

    -- daily_summary 집계
    INSERT INTO daily_summary (store_id, summary_date, total_sales, total_orders, total_qty, avg_ticket, weather, temperature)
    SELECT
      v_store_id,
      v_date,
      COALESCE(SUM(total_amount), 0),
      COUNT(*),
      COALESCE(SUM(qty), 0),
      CASE WHEN COUNT(*) > 0 THEN (SUM(total_amount) / COUNT(*))::integer ELSE 0 END,
      v_weather,
      v_temp
    FROM sales
    WHERE store_id = v_store_id AND sold_at::date = v_date
    ON CONFLICT (store_id, summary_date) DO UPDATE SET
      total_sales  = EXCLUDED.total_sales,
      total_orders = EXCLUDED.total_orders,
      total_qty    = EXCLUDED.total_qty,
      avg_ticket   = EXCLUDED.avg_ticket,
      weather      = EXCLUDED.weather,
      temperature  = EXCLUDED.temperature;
  END LOOP;
END;
$$;
