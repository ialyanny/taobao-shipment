# Handoff — 淘寶集運管理系統（taobao-shipment）

## ⏯️ 目前做到哪

**人員後台管理 + bug 修正（2026-11-05，Claude）**

使用者需求：
1. 最佳化專案，找 bug、讓操作更順暢
2. 後台管理：可以新增集運人員、設定人員密碼

### 做了什麼

- 人員與密碼改存 Supabase（`supabase-migration-app-users.sql`），前端移除 `USER_PASSWORDS`
- 新增「後台管理」分頁（管理員才看得到）、每人「修改密碼」
- Bug：`arrived_at` 未寫入、狀態顯示、批次名稱撞號、`switchTab('pending')`、一般使用者可刪已入批次包裹
- 順暢度：資料沒變不重畫、輸入中延後重畫、背景不輪詢、三表並行抓取、Esc 關視窗

### 驗證

- SQL：本機 PostgreSQL 16 以 `anon` 角色實測全部 RPC（登入/錯誤/鎖定/權限/改名/排序/停用/刪除/保護最後一位管理員），可重複執行
- 前端：Playwright + 模擬 Supabase，33 項流程測試全過（桌機＋手機 390px 無橫向捲動、無 JS 錯誤）

## 🚦 上線順序（重要）

1. Supabase SQL Editor 執行 `supabase-migration-app-users.sql`
2. 再執行「人員初始資料.sql」（使用者電腦 `C:\Claude\淘寶集運管理系統\`，含密碼，不放 repo）
3. 之後才 commit / push master 並同步 gh-pages（`index.html`、`sw.js`）
   - 若先 push 再跑 SQL：登入畫面會顯示「資料庫尚未安裝人員管理功能」，無法登入
4. 上線後所有人需重新登入一次（舊的登入資料沒有 token）

## ➡️ 下一步

- records/batches/settings 仍為 allow-all RLS（見 AGENTS.md 待辦「安全性」）
- 家人各自修改密碼；大發密碼更換

## 🕐 最後更新

- 時間：2026-11-05
- 更新者：Claude
- Git push：⏳ 待 SQL 執行後再推
