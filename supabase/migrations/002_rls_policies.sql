-- ============================================================
-- POS 인사이트 AI - RLS (Row Level Security) 정책
-- 멀티테넌트 데이터 격리
-- ============================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summary    ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- 헬퍼: 현재 사용자의 store_id 조회
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_store_id()
RETURNS uuid AS $$
  SELECT store_id FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────
-- profiles: 자기 자신 + 같은 매장 멤버 조회
-- ─────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (user_id = auth.uid() OR store_id = get_my_store_id());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ─────────────────────────────────────────
-- stores: 자기 매장만 접근
-- ─────────────────────────────────────────
CREATE POLICY "stores_select" ON stores
  FOR SELECT USING (store_id = get_my_store_id());

CREATE POLICY "stores_update" ON stores
  FOR UPDATE USING (store_id = get_my_store_id());

-- ─────────────────────────────────────────
-- 매장 데이터 테이블 공통 정책 (store_id 기반 격리)
-- ─────────────────────────────────────────

-- menus
CREATE POLICY "menus_select" ON menus
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "menus_insert" ON menus
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "menus_update" ON menus
  FOR UPDATE USING (store_id = get_my_store_id());
CREATE POLICY "menus_delete" ON menus
  FOR DELETE USING (store_id = get_my_store_id());

-- sales
CREATE POLICY "sales_select" ON sales
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "sales_insert" ON sales
  FOR INSERT WITH CHECK (store_id = get_my_store_id());

-- inventory
CREATE POLICY "inventory_select" ON inventory
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "inventory_insert" ON inventory
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "inventory_update" ON inventory
  FOR UPDATE USING (store_id = get_my_store_id());
CREATE POLICY "inventory_delete" ON inventory
  FOR DELETE USING (store_id = get_my_store_id());

-- purchase_orders
CREATE POLICY "orders_select" ON purchase_orders
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "orders_insert" ON purchase_orders
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "orders_update" ON purchase_orders
  FOR UPDATE USING (store_id = get_my_store_id());

-- daily_summary
CREATE POLICY "summary_select" ON daily_summary
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "summary_insert" ON daily_summary
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "summary_update" ON daily_summary
  FOR UPDATE USING (store_id = get_my_store_id());

-- social_accounts
CREATE POLICY "social_select" ON social_accounts
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "social_insert" ON social_accounts
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "social_update" ON social_accounts
  FOR UPDATE USING (store_id = get_my_store_id());
CREATE POLICY "social_delete" ON social_accounts
  FOR DELETE USING (store_id = get_my_store_id());

-- marketing_posts
CREATE POLICY "posts_select" ON marketing_posts
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "posts_insert" ON marketing_posts
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "posts_update" ON marketing_posts
  FOR UPDATE USING (store_id = get_my_store_id());

-- chat_sessions
CREATE POLICY "chat_sessions_select" ON chat_sessions
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "chat_sessions_insert" ON chat_sessions
  FOR INSERT WITH CHECK (store_id = get_my_store_id());

-- chat_messages (세션 기반 접근)
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    session_id IN (SELECT session_id FROM chat_sessions WHERE store_id = get_my_store_id())
  );
CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (SELECT session_id FROM chat_sessions WHERE store_id = get_my_store_id())
  );
