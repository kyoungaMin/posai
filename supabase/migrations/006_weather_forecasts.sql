-- ============================================================
-- POS 인사이트 AI - 날씨 예보 데이터 저장
-- OpenWeatherMap 5-Day Forecast 캐시 + 이력 관리
-- ============================================================

CREATE TABLE weather_forecasts (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id       uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  forecast_date  date NOT NULL,
  weather        text NOT NULL,           -- 맑음, 흐림, 비, 눈 등
  temp           smallint NOT NULL,        -- 평균 기온 (℃)
  temp_min       smallint NOT NULL,        -- 최저 기온
  temp_max       smallint NOT NULL,        -- 최고 기온
  humidity       smallint NOT NULL,        -- 평균 습도 (%)
  wind_speed     numeric(4, 1) NOT NULL,   -- 풍속 (m/s)
  pop            smallint NOT NULL DEFAULT 0, -- 강수 확률 (%)
  source         text NOT NULL DEFAULT 'openweathermap',
  fetched_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (store_id, forecast_date, source)
);

COMMENT ON TABLE weather_forecasts IS '날씨 예보 캐시 (OpenWeatherMap 데이터 저장, 날씨-매출 상관분석용)';

CREATE INDEX idx_weather_store_date ON weather_forecasts (store_id, forecast_date);

-- RLS
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weather_select" ON weather_forecasts
  FOR SELECT USING (store_id = get_my_store_id());
CREATE POLICY "weather_insert" ON weather_forecasts
  FOR INSERT WITH CHECK (store_id = get_my_store_id());
CREATE POLICY "weather_update" ON weather_forecasts
  FOR UPDATE USING (store_id = get_my_store_id());
