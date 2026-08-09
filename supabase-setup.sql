-- 淘寶集運管理 - Supabase 資料表設定
-- 使用方法：登入 https://supabase.com → 建立專案 → 左側 SQL Editor → 貼上全部 → Run

create table if not exists public.records (
  id text primary key,
  time bigint not null,
  name text not null,
  order_no text not null,
  item text,
  amount text,
  batch_id text,
  arrived boolean default false,
  weight numeric,
  arrived_date bigint
);

-- 既有資料表若缺少新欄位，用以下指令補上（可重複執行）
alter table public.records add column if not exists weight numeric;
alter table public.records add column if not exists arrived_date bigint;

create table if not exists public.batches (
  id text primary key,
  name text not null,
  created_at bigint not null
);

alter table public.records enable row level security;
alter table public.batches enable row level security;

drop policy if exists "allow all" on public.records;
create policy "allow all" on public.records
  for all using (true) with check (true);

drop policy if exists "allow all" on public.batches;
create policy "allow all" on public.batches
  for all using (true) with check (true);

-- 啟用即時同步（若已存在會顯示錯誤，可忽略）
do $$
begin
  alter publication supabase_realtime add table public.records;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.batches;
exception when others then null;
end $$;
