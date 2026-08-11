-- 淘寶集運 - 新增「備註」欄位與「設定」表
-- 使用方法：登入 https://supabase.com → 左側 SQL Editor → New query → 貼上全部 → Run

-- 包裹備註欄位（供待認領包裹顯示備註）
alter table public.records add column if not exists remark text;

-- 設定表（存放提醒注意事項等）
create table if not exists public.settings (
  key text primary key,
  value text
);

alter table public.settings enable row level security;

drop policy if exists "allow all" on public.settings;
create policy "allow all" on public.settings
  for all using (true) with check (true);

-- 啟用即時同步（若已存在會顯示錯誤，可忽略）
do $$
begin
  alter publication supabase_realtime add table public.settings;
exception when others then null;
end $$;
