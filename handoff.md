# Handoff — 淘寶集運管理系統（taobao-shipment）

## ⏯️ 目前做到哪

淘寶導入 bookmarklet 已完成第 3 版迭代並部署（master `700fe57` / gh-pages `5211b94`，blob 一致）：
- 抓**物流單號**（非訂單號）、bookmarklet 端彈出**勾選清單**（showSelector）讓使用者選要載入哪幾筆
- 系統端 `importTbOrders` 以物流單號為 orderNo、**自動跳過已存在單號**、跳過無物流單號者
- **品項截前 10 字**、**金額自動帶入**、**直接掛在登入者名下**（name = currentUser.name），**不再走待認領**
- 卡片/說明文字同步更新（「直接加到你個人的包裹列表」）

## 🚦 目前狀態

可運行（GitHub Pages https 正常）。本次功能均已用 CDP 端到端驗證：
- 勾選面板渲染/計數/全選全不選/無物流禁用 ✅
- 跳轉 payload 只含勾選筆 ✅
- 導入直接進登入者列表、item 截 10 字、amount 帶入 ✅（Supabase 實寫驗證後已刪測試資料）
- 語法驗證（esprima）通過、sw.js 仍為 v4

已知但無礙：Supabase records 表欄位是 snake_case（`order_no`），系統內 JS 用 camelCase，靠 `recRow()` 轉換，屬既有設計。

## ➡️ 下一步

1. 待認領清單中「采蕨」包裹（真實淘寶導入測試留下，item 為完整品名、訂單 5127366494018018816）——與使用者確認是否保留/認領/刪除
2. 如需讓 bookmarklet 面板標記「系統已有」，須在系統端處理（bookmarklet 跨域無法即時查）；目前靠系統端 `importTbOrders` 去重已足夠
3. 若 SW 版本異動，記得升 v（目前 v4，APP_SHELL 含 tb-bookmarklet.js）

## ⚠️ 注意事項

- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`（untracked）
- file:// 下 fetch/XHR 被 CORS 擋，本機測試用 http.server（`python -m http.server`）或 GitHub Pages https
- 大發第三方導入需桌面端「集運助手」，無法純 API 繞過
- 測試資料殘留檢查：查 Supabase `records` 是否有 `測試店甲/商店甲/小米旗艦店` 等 marker；本次已刪 1 筆（p1786724327565_unxae）

## 🕐 最後更新

- 時間：2026-08-15
- 更新者：opencode @ CORNI-PC（`$env:COMPUTERNAME` 回傳空值，未取得）
- Git push：✅ 已推（master 700fe57、gh-pages 5211b94）
- L3 Obsidian：❌ 本次無 Obsidian MCP 工具可寫入（vault 在 D:\ObsidianVault，僅 welcome.md），回高層級電腦補