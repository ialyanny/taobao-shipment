-- 淘寶集運 - 人員帳號與後台管理（密碼以 bcrypt 加密存放，前端程式碼不再有任何密碼）
-- 使用方法：登入 https://supabase.com → 左側 SQL Editor → New query → 貼上全部 → Run（可重複執行）
-- 執行後再跑一次「人員初始資料」SQL（不放在 repo 裡，避免密碼公開）建立既有的家人帳號。
--
-- 設計：
--   app_users     人員（姓名、密碼雜湊、管理員、啟用）
--   app_sessions  登入憑證（token），登入後 180 天有效、使用中自動延長
--   兩張表都開 RLS 且沒有任何 policy → 前端（anon key）完全讀不到，只能透過下列 RPC 函式存取
--   連續輸錯密碼 5 次鎖 5 分鐘（防止 3～4 位數密碼被暴力猜）

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_users (
  name text primary key,
  password_hash text,                    -- null = 不需密碼
  is_admin boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  failed_count int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  token text primary key,
  name text not null references public.app_users(name) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
revoke all on public.app_users from anon, authenticated;
revoke all on public.app_sessions from anon, authenticated;

-- ── 內部工具 ─────────────────────────────────────────────

create or replace function public._app_user_by_token(p_token text)
returns public.app_users
language plpgsql security definer set search_path = public, extensions as $$
declare u public.app_users;
begin
  select a.* into u
    from public.app_sessions s join public.app_users a on a.name = s.name
   where s.token = p_token and s.expires_at > now() and a.active;
  if u.name is null then
    raise exception '登入已過期，請重新登入' using errcode = 'P0401';
  end if;
  update public.app_sessions set expires_at = now() + interval '180 days'
   where token = p_token and expires_at < now() + interval '170 days';
  return u;
end $$;

create or replace function public._app_require_admin(p_token text)
returns public.app_users
language plpgsql security definer set search_path = public, extensions as $$
declare u public.app_users;
begin
  u := public._app_user_by_token(p_token);
  if not u.is_admin then
    raise exception '需要管理員權限' using errcode = 'P0403';
  end if;
  return u;
end $$;

create or replace function public._app_clean_name(p_name text)
returns text
language plpgsql immutable as $$
declare n text := btrim(coalesce(p_name, ''));
begin
  if n = '' then raise exception '姓名不能空白' using errcode = 'P0422'; end if;
  if char_length(n) > 20 then raise exception '姓名最多 20 個字' using errcode = 'P0422'; end if;
  return n;
end $$;

create or replace function public._app_hash(p_password text)
returns text
language sql security definer set search_path = public, extensions as $$
  select case when coalesce(p_password, '') = '' then null
              else extensions.crypt(p_password, extensions.gen_salt('bf', 8)) end
$$;

create or replace function public._app_admin_count()
returns int
language sql security definer set search_path = public as $$
  select count(*)::int from public.app_users where is_admin and active
$$;

-- ── 公開：登入畫面 ───────────────────────────────────────

create or replace function public.app_list_names()
returns table(name text, has_password boolean)
language sql stable security definer set search_path = public as $$
  select u.name, u.password_hash is not null
    from public.app_users u
   where u.active
   order by u.sort_order, u.created_at, u.name
$$;

-- 登入失敗回傳 {"error": "..."} 而不是 raise：raise 會把「錯誤次數 +1」一起 rollback，鎖定就失效了
create or replace function public.app_login(p_name text, p_password text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u public.app_users; t text;
begin
  select * into u from public.app_users where name = btrim(coalesce(p_name, '')) and active;
  if u.name is null then
    return json_build_object('error', '查無此人員或已停用');
  end if;
  if u.locked_until is not null and u.locked_until > now() then
    return json_build_object('error', '密碼錯誤次數過多，請 ' ||
      greatest(1, ceil(extract(epoch from (u.locked_until - now())) / 60))::int || ' 分鐘後再試');
  end if;
  if u.password_hash is not null and
     (coalesce(p_password, '') = '' or extensions.crypt(p_password, u.password_hash) <> u.password_hash) then
    update public.app_users
       set failed_count = case when failed_count + 1 >= 5 then 0 else failed_count + 1 end,
           locked_until = case when failed_count + 1 >= 5 then now() + interval '5 minutes' else null end
     where name = u.name;
    return json_build_object('error', '密碼錯誤');
  end if;
  update public.app_users set failed_count = 0, locked_until = null where name = u.name;
  delete from public.app_sessions where expires_at < now();
  t := encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.app_sessions(token, name, expires_at) values (t, u.name, now() + interval '180 days');
  return json_build_object('token', t, 'name', u.name, 'is_admin', u.is_admin);
end $$;

create or replace function public.app_session(p_token text)
returns json
language plpgsql security definer set search_path = public as $$
declare u public.app_users;
begin
  u := public._app_user_by_token(p_token);
  return json_build_object('name', u.name, 'is_admin', u.is_admin);
end $$;

create or replace function public.app_logout(p_token text)
returns void
language sql security definer set search_path = public as $$
  delete from public.app_sessions where token = p_token
$$;

create or replace function public.app_change_my_password(p_token text, p_old text, p_new text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare u public.app_users;
begin
  u := public._app_user_by_token(p_token);
  if u.password_hash is not null and
     (coalesce(p_old, '') = '' or extensions.crypt(p_old, u.password_hash) <> u.password_hash) then
    raise exception '目前密碼不正確' using errcode = 'P0401';
  end if;
  update public.app_users set password_hash = public._app_hash(p_new), updated_at = now() where name = u.name;
  delete from public.app_sessions where name = u.name and token <> p_token;
end $$;

-- ── 管理員：後台管理 ─────────────────────────────────────

create or replace function public.app_list_users(p_token text)
returns table(name text, is_admin boolean, active boolean, has_password boolean,
              sort_order int, locked boolean, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  perform public._app_require_admin(p_token);
  return query
    select u.name, u.is_admin, u.active, u.password_hash is not null, u.sort_order,
           (u.locked_until is not null and u.locked_until > now()), u.created_at
      from public.app_users u
     order by u.active desc, u.sort_order, u.created_at, u.name;
end $$;

create or replace function public.app_add_user(p_token text, p_name text, p_password text, p_is_admin boolean)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare n text;
begin
  perform public._app_require_admin(p_token);
  n := public._app_clean_name(p_name);
  if exists (select 1 from public.app_users where name = n) then
    raise exception '「%」已經存在', n using errcode = 'P0409';
  end if;
  insert into public.app_users(name, password_hash, is_admin, sort_order)
  values (n, public._app_hash(p_password), coalesce(p_is_admin, false),
          coalesce((select max(sort_order) + 1 from public.app_users), 0));
end $$;

create or replace function public.app_set_password(p_token text, p_name text, p_password text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public._app_require_admin(p_token);
  update public.app_users
     set password_hash = public._app_hash(p_password), failed_count = 0, locked_until = null, updated_at = now()
   where name = p_name;
  if not found then raise exception '查無此人員' using errcode = 'P0404'; end if;
  delete from public.app_sessions where name = p_name and token <> p_token;
end $$;

create or replace function public.app_update_user(p_token text, p_name text, p_is_admin boolean, p_active boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare me public.app_users; cur public.app_users;
begin
  me := public._app_require_admin(p_token);
  select * into cur from public.app_users where name = p_name;
  if cur.name is null then raise exception '查無此人員' using errcode = 'P0404'; end if;
  if p_name = me.name and (not coalesce(p_is_admin, true) or not coalesce(p_active, true)) then
    raise exception '不能取消自己的管理員權限或停用自己' using errcode = 'P0422';
  end if;
  if cur.is_admin and cur.active and (not coalesce(p_is_admin, cur.is_admin) or not coalesce(p_active, cur.active))
     and public._app_admin_count() <= 1 then
    raise exception '至少要保留一位管理員' using errcode = 'P0422';
  end if;
  update public.app_users
     set is_admin = coalesce(p_is_admin, is_admin), active = coalesce(p_active, active), updated_at = now()
   where name = p_name;
  if not coalesce(p_active, true) then
    delete from public.app_sessions where name = p_name;
  end if;
end $$;

-- 改名會一併更新包裹（records.name），避免舊包裹變成孤兒
create or replace function public.app_rename_user(p_token text, p_name text, p_new_name text)
returns void
language plpgsql security definer set search_path = public as $$
declare n text;
begin
  perform public._app_require_admin(p_token);
  n := public._app_clean_name(p_new_name);
  if n = p_name then return; end if;
  if not exists (select 1 from public.app_users where name = p_name) then
    raise exception '查無此人員' using errcode = 'P0404';
  end if;
  if exists (select 1 from public.app_users where name = n) then
    raise exception '「%」已經存在', n using errcode = 'P0409';
  end if;
  update public.app_users set name = n, updated_at = now() where name = p_name;
  if to_regclass('public.records') is not null then
    update public.records set name = n where name = p_name;
  end if;
end $$;

create or replace function public.app_move_user(p_token text, p_name text, p_dir int)
returns void
language plpgsql security definer set search_path = public as $$
declare i int := 0; names text[]; idx int; tmp text;
begin
  perform public._app_require_admin(p_token);
  select array_agg(u.name order by u.sort_order, u.created_at, u.name) into names from public.app_users u;
  idx := array_position(names, p_name);
  if idx is null then raise exception '查無此人員' using errcode = 'P0404'; end if;
  if idx + p_dir < 1 or idx + p_dir > array_length(names, 1) then return; end if;
  tmp := names[idx + p_dir]; names[idx + p_dir] := names[idx]; names[idx] := tmp;
  for i in 1 .. array_length(names, 1) loop
    update public.app_users set sort_order = i where name = names[i];
  end loop;
end $$;

create or replace function public.app_delete_user(p_token text, p_name text)
returns void
language plpgsql security definer set search_path = public as $$
declare me public.app_users; cur public.app_users;
begin
  me := public._app_require_admin(p_token);
  if p_name = me.name then raise exception '不能刪除自己' using errcode = 'P0422'; end if;
  select * into cur from public.app_users where name = p_name;
  if cur.name is null then raise exception '查無此人員' using errcode = 'P0404'; end if;
  if cur.is_admin and cur.active and public._app_admin_count() <= 1 then
    raise exception '至少要保留一位管理員' using errcode = 'P0422';
  end if;
  delete from public.app_users where name = p_name;
end $$;

-- ── 權限：內部工具不開放，公開函式給 anon 呼叫 ───────────
revoke all on function public._app_user_by_token(text) from public, anon, authenticated;
revoke all on function public._app_require_admin(text) from public, anon, authenticated;
revoke all on function public._app_hash(text) from public, anon, authenticated;
revoke all on function public._app_admin_count() from public, anon, authenticated;

grant execute on function public.app_list_names() to anon, authenticated;
grant execute on function public.app_login(text, text) to anon, authenticated;
grant execute on function public.app_session(text) to anon, authenticated;
grant execute on function public.app_logout(text) to anon, authenticated;
grant execute on function public.app_change_my_password(text, text, text) to anon, authenticated;
grant execute on function public.app_list_users(text) to anon, authenticated;
grant execute on function public.app_add_user(text, text, text, boolean) to anon, authenticated;
grant execute on function public.app_set_password(text, text, text) to anon, authenticated;
grant execute on function public.app_update_user(text, text, boolean, boolean) to anon, authenticated;
grant execute on function public.app_rename_user(text, text, text) to anon, authenticated;
grant execute on function public.app_move_user(text, text, int) to anon, authenticated;
grant execute on function public.app_delete_user(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
