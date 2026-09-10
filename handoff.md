# Handoff — 淘寶集運管理系統（taobao-shipment）

## ⏯️ 目前做到哪

**大發同步：物品欄空白時，自動從系統 records 補入同單號品項**（master `d23b702` / gh-pages `3f7ea80`，blob 一致）。

本次歷程（2026-09-04）：
1. 使用者需求：大發物品欄空白時，自動從系統 records 補入同單號的品項
2. 分析 syncDafa（`index.html` 行 ~2093-2118）：問題在 unmatched.push 時 `rec` 必為 undefined（有 map[no] 就走已存在分支），無法從 map 取 item
3. 方案：在**已存在分支**加入逆向補入——若 `rec.item` 有值且大發 `p.itemName` 空白 → `update.item_name = rec.item` 並同步到 `p.itemName`（順便帶回大發）
4. 真正 unmatched（系統無此單號）本來就沒資料可填，不需要處理
5. 驗證：`new Function` 語法通過；node 單元模擬測試（mock records + mock pkgs）全 PASS（matched=3、updated=2、TEST- 跳過、unmatched 只留新單號）
6. 部署：master commit `d23b702` → gh-pages `3f7ea80`，blob 均 `c171c450…` 一致

## 🚦 目前狀態

可運行（GitHub Pages https 正常）。syncDafa 於已存在分支現在會：
- 大發有 item、系統空白 → 保留（不覆蓋）
- 大發空白、系統有 item → 用系統 item 補入
- 兩邊都有 → 以既有 update（weight/arrived_date/remark）為準

## ➡️ 下一步（歷史遺留，判斷是否仍適用）

1. 「采蕨」包裹：2026-08-15 查 Supabase records（order_no/name/item/remark）皆無，應已不在系統；若大發倉庫端仍有測試包裹，下次 syncDafa 可能再被推播進待認領，屆時再處理
2. `rdq/RDQ-spec-mobile-tb-import-20260815.md` 規格卡保留為決策紀錄（confirmed 但功能已移除）

## ⚠️ 注意事項

- 2026-09-10 照片全掛排查：程式/資料/SW 皆正常，是使用者 WiFi 連不到阿里雲廣州 OSS，切 4G 即恢復；下次先換網路測
- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`（untracked）
- 註：gh-pages 分支仍含 `tb-bookmarklet.js`、`tb-import-mobile.js`（本次未動）；若需徹底清除可另處理
- file:// 下 fetch/XHR 被 CORS 擋，本機測試用 http.server（`python -m http.server`）或 GitHub Pages https
- 大發第三方導入需桌面端「集運助手」，無法純 API 繞過
- 手機自動帶入淘寶訂單不可行（iOS Safari／Android Chrome 封鎖 `javascript:` 書籤與網址列，實測確認）
- GitHub Pages 更新偶發延遲：可用 gh-pages 空 commit 觸發重新發布

## 🕐 最後更新

- 時間：2026-09-04
- 更新者：opencode @ 均均
- Git push：✅ 已推（master d23b702、gh-pages 3f7ea80）
- L3 Obsidian：❌（vault 在 D:\ObsidianVault，僅 welcome.md）