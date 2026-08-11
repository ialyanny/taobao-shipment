-- 淘寶集運 - 新增「包裹照片」欄位（存 JSON 字串，例如 ["url1","url2"]）
-- 使用方法：登入 https://supabase.com → 左側 SQL Editor → New query → 貼上全部 → Run

alter table public.records add column if not exists package_images text;
