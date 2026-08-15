# Handoff — 淘寶集運管理系統（taobao-shipment）

## ⏯️ 目前做到哪

**淘寶導入已全部移除，申報恢復單一表單**（master `47fe982` / gh-pages `4614ef6`，blob 一致；`tb-bookmarklet.js`、`tb-import-mobile.js`、`mobile-import-test.md` 已刪除，sw.js 升 v6）。

本次歷程（2026-08-15）：
1. 使用者要求改善手機載入淘寶訂單 → RDQ 訪談（Lite）→ 規格卡 `rdq/RDQ-spec-mobile-tb-import-20260815.md` confirmed
2. 實作手機方案：登錄卡片「批次貼上物流單號」（`bulkAddFromPaste`，node 單元測試驗證）＋Android 短導入碼（166 字元載入 `tb-import-mobile.js`）→ commit `20deecc`
3. 實測結論：**iOS Safari／Android Chrome 皆封鎖 `javascript:` 書籤與網址列**，手機瀏覽器自動帶入不可行（實測確認，另有 CSP/CORS 驗證：淘寶訂單頁無 CSP、h5api 允許跨域，但執行管道被瀏覽器封死）
4. 使用者決定**全部移除淘寶導入**，包裹申報恢復一個一個申報 → `47fe982`

## 🚦 目前狀態

可運行（GitHub Pages https 正常，已驗證 sw v6、tb-import-mobile.js 404、無導入卡片）。語法驗證通過，無殘留引用（tbimport/importTbOrders/bulkAdd 等已清除）。

部署陷阱：本次 push 後 Pages CDN 卡舊版超過 15 分鐘，用 gh-pages 空 commit（`chore: trigger pages rebuild`，`d01b0d4`）觸發後即生效。

## ➡️ 下一步

1. 「采蕨」包裹：2026-08-15 查 Supabase records（order_no/name/item/remark）皆無，應已不在系統；若大發倉庫端仍有測試包裹，下次 syncDafa 可能再被推播進待認領，屆時再處理
2. 淘寶導入測試留下的包裹資料（remark 含「淘寶導入：」、掛在登入者名下）**未清除**——若使用者要清，需列出來確認後再刪
3. `rdq/RDQ-spec-mobile-tb-import-20260815.md` 規格卡保留為決策紀錄（confirmed 但功能已移除）

## ⚠️ 注意事項

- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`（untracked）
- file:// 下 fetch/XHR 被 CORS 擋，本機測試用 http.server（`python -m http.server`）或 GitHub Pages https
- 大發第三方導入需桌面端「集運助手」，無法純 API 繞過
- 手機自動帶入淘寶訂單不可行（iOS Safari／Android Chrome 封鎖 `javascript:` 書籤與網址列，實測確認）
- GitHub Pages 更新偶發延遲：可用 gh-pages 空 commit 觸發重新發布

## 🕐 最後更新

- 時間：2026-08-15
- 更新者：opencode @ 均均
- Git push：✅ 已推（master 47fe982、gh-pages d01b0d4）
- L3 Obsidian：❌ 本次無 Obsidian MCP 工具可寫入（vault 在 D:\ObsidianVault，僅 welcome.md），回高層級電腦補