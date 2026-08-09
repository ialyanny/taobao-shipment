-- 淘寶集運 - 新增「重量」與「到貨日期」欄位
-- 使用方法：登入 https://supabase.com → 左側 SQL Editor → New query → 貼上全部 → Run

alter table public.records add column if not exists weight numeric;
alter table public.records add column if not exists arrived_date bigint;
