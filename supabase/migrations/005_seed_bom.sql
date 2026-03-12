-- ============================================================
-- 레시피 BOM 시드 데이터
-- 메뉴별 필요 재고 품목 매핑
-- ============================================================

-- 메뉴ID와 재고ID는 003_seed_data.sql 기준
-- menus:  1=아메리카노, 2=카페라떼, 3=바닐라라떼, 4=카라멜프라페, 5=치즈케이크, 6=크루아상
-- inventory: 1=우유, 2=에스프레소원두, 3=치즈케이크, 4=바닐라시럽, 5=크루아상, 6=캐러멜소스, 7=종이컵, 8=빨대

-- 아메리카노: 원두 18g + 종이컵 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (1, 2, 0.018),   -- 원두 18g = 0.018kg
  (1, 7, 1);        -- 종이컵 1개

-- 카페라떼: 원두 18g + 우유 200ml + 종이컵 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (2, 2, 0.018),
  (2, 1, 0.2),     -- 우유 200ml = 0.2L
  (2, 7, 1);

-- 바닐라라떼: 원두 18g + 우유 200ml + 바닐라시럽 30ml + 종이컵 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (3, 2, 0.018),
  (3, 1, 0.2),
  (3, 4, 0.03),    -- 바닐라시럽 30ml = 0.03L
  (3, 7, 1);

-- 카라멜프라페: 원두 18g + 우유 250ml + 캐러멜소스 20ml + 종이컵 1개 + 빨대 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (4, 2, 0.018),
  (4, 1, 0.25),
  (4, 6, 0.02),    -- 캐러멜소스 20ml = 0.02L
  (4, 7, 1),
  (4, 8, 1);        -- 빨대

-- 치즈케이크: 치즈케이크 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (5, 3, 1);

-- 크루아상: 크루아상 1개
INSERT INTO recipes_bom (menu_id, item_id, qty) VALUES
  (6, 5, 1);
