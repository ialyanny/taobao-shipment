# Handoff — 淘寶集運管理系統（taobao-shipment）

## ⏯️ 目前做到哪

**大發對接除錯 + 需求落地（2026-11-02）**：分頁 off-by-one、已集運包裹不再回推、推送前逐一確認單號。

使用者需求（本次）：
1. 大發網站物品欄空白時，自動帶入我們系統有記錄的資料
2. 我們系統已經集運的包裹，不要再帶入大發系統

### 實測（唯讀，只登入與查詢，未送出任何預報）

| 項目 | 結果 |
|---|---|
| 登入 `portal/auth/login` | ✅ 取得 token |
| CORS（Origin=ialyanny.github.io） | ✅ 有回 `access-control-allow-origin` |
| `query/page-list` 總筆數 | 4076（900 已發運 3986、500 揀貨 5、990 取消 3、130 中轉上架 2、700 裝箱 2、997 銷毀 1、110 預報入庫 1） |
| 倉內（110/120/130） | 僅 3 筆 |
| `queryImages` | ✅ 正常回阿里雲 OSS 簽名網址 |
| `firstWaybillNo` 精準查詢 | ✅ 跨狀態可查（不存在回 total=0） |
| Supabase records | 56 筆（54 已集運、2 待集運） |

### 修掉的三個問題

1. **分頁 off-by-one（真 bug）**：大發 `pageNum` 是 **1 起算**，`pageNum=0` 與 `1` 回同一頁。舊碼 `page(0)` 起算 → 第一頁重複、**最後一頁永遠抓不到**（實測少 76 筆，2021-11～2023-08 舊包裹）。已改 1 起算 + 以 `id` 去重 + `maxPage` 上限，實測 21 次請求抓到 4076 筆（與 API total 一致）。
2. **已集運包裹仍會被推預報（真 bug）**：`toForecast` 只濾 `name && item`。已改 `r.name && r.item && r.batchId == null && !r.arrived`。
3. **重複帶入風險**：新增 `dafaFindPackage(no)`，推送前用 `firstWaybillNo` 逐一確認；大發任何狀態已有此單號就跳過（`skipped`），查詢失敗也跳過（列入 failed 提示），不再誤推。因為改用逐一確認，**移除原本每次同步抓 4000+ 筆（21 次請求）的比對**。

### 順手修掉

- 補預報改為只要系統 `rec.item` 有值就補（原本要求有姓名，待認領包裹補不到品項）
- 補預報保留大發原有 `customerRemark`（`dafaForecastPayload(r, preferRemark)`），不再被系統姓名覆蓋

## 🚦 目前狀態

- 程式已改在 **master 工作區**（`index.html`、`AGENTS.md`、`handoff.md`、`sw.js`）
- `node` 語法檢查通過（inline script `new Function` OK）
- 分頁新邏輯已用真實 API 驗證：4076 筆 / 21 次請求，含最後一頁樣本 `433399149170859`
- 預報篩選邏輯已用 mock 驗證：已集運、已到貨、無姓名都不會被推

### 已完成的大發資料整理（2026-11-02）

- `435425505350380`（榮吉／路亞鉗）為**換過的單號**，使用者確認應保留
- 舊預報 `9840119456912`（id `2109950480023695362`、路亞鉗／榮吉／110 預報入庫）**已從大發刪除**：`POST /member-package/remove`，body `{"ids":["<id>"]}`（實測 `ids` 是正確欄位，其他如 `param`/`id` 都會回「失败」）
- 刪除後大發總筆數 4076 → 4075；`435425505350380` 目前查無，下次同步會自動預報進去

## ➡️ 下一步

1. 使用者於 iPad／瀏覽器實測一次「大發同步」，確認：`435425505350380` 被預報、訊息出現「已跳過不重複帶入 N 筆」
2. 大發 `79155198366175`（130 中轉上架、物品空白、無備註、120g、2026-11-02 建立）系統查無 → 下次同步會進待認領，需人工認領填品項

## ⚠️ 注意事項

- 大發 `pageNum` **1 起算**，別再從 0 開始
- `query/page-list` 帶 `firstWaybillNo` 可精準查單筆，跨所有狀態
- 2026-09-10 照片全掛排查：程式/資料/SW 皆正常，是使用者 WiFi 連不到阿里雲廣州 OSS，切 4G 即恢復；下次先換網路測
- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`（untracked）
- gh-pages 分支仍含 `tb-bookmarklet.js`、`tb-import-mobile.js`
- file:// 下 fetch/XHR 被 CORS 擋，本機測試用 `python -m http.server` 或 GitHub Pages https
- 手機自動帶入淘寶訂單不可行（iOS Safari／Android Chrome 封鎖 `javascript:` 書籤與網址列，實測確認）

## 🕐 最後更新

- 時間：2026-11-02
- 更新者：opencode @ 均均
- Git push：⏳ 待推（master 工作區已改，尚未 commit）
- L3 Obsidian：❌（vault 在 D:\ObsidianVault，僅 welcome.md）
