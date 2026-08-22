-- 淘寶集運 - 新增「批次到貨時間」欄位（狀態列顯示今天到貨日期，區別於集運倉到貨日期 arrived_date）
-- 使用方法：Supabase → SQL Editor → New query → 貼上全部 → Run
-- 此欄位用於記錄「全數到貨」或單筆勾選已到貨時的本地時間，顯示於「包裹總覽」狀態欄與「集運批次」批次內。
alter table public.records add column if not exists arrived_at bigint;
