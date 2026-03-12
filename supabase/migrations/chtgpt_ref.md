POS AI SaaS DB Schema
POS Data 기반 AI SaaS Database 설계
1. 설계 원칙

POS AI SaaS DB는 다음 원칙으로 설계합니다.

1️⃣ 멀티테넌시 SaaS 구조

모든 데이터는

tenant → brand → store

계층으로 관리됩니다.

2️⃣ POS Raw 데이터 보존

POS마다 데이터 구조가 다르므로

raw tables

을 별도로 유지합니다.

3️⃣ 운영 데이터 / 분석 데이터 분리

구조

Raw → Standard → Mart → AI Output
2. 전체 DB 구조
auth / tenancy
store management
product & menu
sales
inventory
purchase
analytics mart
ai predictions
alerts
billing
3. Tenancy / Account
tenants
field	type
tenant_id	uuid
name	text
plan_type	text
created_at	timestamp
users
field	type
user_id	uuid
tenant_id	uuid
email	text
password_hash	text
name	text
role	text
created_at	timestamp
memberships
field	type
membership_id	uuid
tenant_id	uuid
user_id	uuid
role	text
4. 브랜드 / 매장
brands
field	type
brand_id	uuid
tenant_id	uuid
name	text
created_at	timestamp
stores
field	type
store_id	uuid
tenant_id	uuid
brand_id	uuid
store_name	text
store_type	text
address	text
open_date	date
terminals

POS 단말기

field	type
terminal_id	uuid
store_id	uuid
pos_system	text
terminal_name	text
5. POS Raw Data
raw_sales_transactions
field	type
raw_id	bigint
source_system	text
store_code	text
pos_order_id	text
sales_datetime	timestamp
payload_json	jsonb
ingested_at	timestamp
raw_inventory
field	type
raw_id	bigint
source_system	text
item_code	text
qty	numeric
snapshot_time	timestamp
raw_products
field	type
raw_id	bigint
source_system	text
product_code	text
product_name	text
price	numeric
6. 상품 / 메뉴
product_categories
field	type
category_id	uuid
tenant_id	uuid
name	text
products
field	type
product_id	uuid
tenant_id	uuid
category_id	uuid
product_name	text
price	numeric
cost	numeric
created_at	timestamp
recipes_bom

메뉴 레시피

field	type
bom_id	uuid
product_id	uuid
inventory_item_id	uuid
qty	numeric
7. 판매 데이터
sales_orders
field	type
order_id	uuid
tenant_id	uuid
store_id	uuid
pos_order_id	text
order_datetime	timestamp
total_amount	numeric
payment_status	text
sales_order_items
field	type
order_item_id	uuid
order_id	uuid
product_id	uuid
qty	numeric
price	numeric
payments
field	type
payment_id	uuid
order_id	uuid
payment_method	text
amount	numeric
payment_time	timestamp
refunds
field	type
refund_id	uuid
order_id	uuid
amount	numeric
refund_time	timestamp
8. 재고 관리
inventory_items
field	type
inventory_item_id	uuid
tenant_id	uuid
name	text
unit	text
inventory_transactions
field	type
transaction_id	uuid
store_id	uuid
inventory_item_id	uuid
qty_change	numeric
transaction_type	text
created_at	timestamp
inventory_snapshots
field	type
snapshot_id	uuid
store_id	uuid
inventory_item_id	uuid
qty	numeric
snapshot_time	timestamp
9. 발주 관리
suppliers
field	type
supplier_id	uuid
tenant_id	uuid
name	text
contact	text
purchase_orders
field	type
po_id	uuid
store_id	uuid
supplier_id	uuid
order_date	date
status	text
purchase_order_items
field	type
po_item_id	uuid
po_id	uuid
inventory_item_id	uuid
qty	numeric
price	numeric
10. Analytics Mart
mart_daily_store_sales
field	type
store_id	uuid
sales_date	date
total_sales	numeric
order_count	int
mart_hourly_sales
field	type
store_id	uuid
sales_date	date
hour	int
sales_amount	numeric
mart_product_sales_daily
field	type
product_id	uuid
store_id	uuid
sales_date	date
qty	numeric
sales_amount	numeric
mart_inventory_turnover
field	type
inventory_item_id	uuid
store_id	uuid
period	date
turnover_ratio	numeric
11. AI Predictions
forecast_daily_sales
field	type
store_id	uuid
forecast_date	date
predicted_sales	numeric
confidence	numeric
created_at	timestamp
forecast_product_sales
field	type
product_id	uuid
store_id	uuid
forecast_date	date
predicted_qty	numeric
reorder_recommendations
field	type
recommendation_id	uuid
store_id	uuid
inventory_item_id	uuid
recommended_qty	numeric
recommended_date	date
menu_health_scores
field	type
product_id	uuid
store_id	uuid
score	numeric
recommendation	text
12. Alert System
alerts
field	type
alert_id	uuid
tenant_id	uuid
store_id	uuid
alert_type	text
message	text
severity	text
created_at	timestamp
alert_settings
field	type
setting_id	uuid
user_id	uuid
alert_type	text
channel	text
13. Billing
subscriptions
field	type
subscription_id	uuid
tenant_id	uuid
plan	text
start_date	date
end_date	date
invoices
field	type
invoice_id	uuid
tenant_id	uuid
amount	numeric
status	text
issued_at	timestamp
14. 데이터 흐름
POS
 ↓
raw_sales_transactions
 ↓
sales_orders
 ↓
mart tables
 ↓
AI predictions
 ↓
dashboard / alerts