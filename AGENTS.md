# 語言

- 一律使用繁體中文（Traditional Chinese）回覆使用者。
- 程式碼、變數名稱、指令輸出保持英文。

# 專案藍圖：淘寶集運管理系統（taobao-shipment）

## 目標

為家庭集運打造單頁系統（`index.html`，PWA），串接大發集運（df.omszt.com）：
- 每人登入後登錄自己的包裹（單號/品項/金額），管理員可建立集運批次、核對到貨
- **大發同步**：一鍵把大發倉庫包裹資料（重量/到貨/備註/照片）拉進來；把確認的包裹推成預報
- ~~**淘寶訂單導入**~~：曾用 bookmarklet 一鍵帶入物流單號/品項/金額（2026-08-15 依使用者要求**全部移除**，申報恢復單一表單）

## 已完成 ✅

- [x] 基礎系統：登入（`ts_user` localStorage）、包裹登錄、待認領、批次、到貨核對、列印單
- [x] **人員帳號改存 Supabase＋後台管理**（2026-11-05）：前端不再有任何密碼（舊 `USER_PASSWORDS` 已移除）；`app_users`（bcrypt）/`app_sessions`（token 180 天）＋ RPC（`supabase-migration-app-users.sql`）；登入畫面姓名從 `app_list_names()` 讀；「後台管理」分頁可新增人員、設定/重設密碼、改名（連同 records.name）、設/取消管理員、停用/啟用、排序、刪除；每人可「修改密碼」；連錯 5 次鎖 5 分鐘；至少保留一位管理員、不能停用/刪除自己
- [x] 大發登入＋一鍵同步（拉：重量/到貨/備註；推：預報 `member-package/save`）→ commit `3793b2e`
- [x] 大發照片同步（`queryImages`，縮圖＋燈箱）→ `066cb0e`；燈箱加旋轉/放大/縮小/重置 → `bacdd1a`；放大後可拖曳平移、工具列固定（避免圖片蓋住按鈕無法操作）→ `08d4b7c`；手機保留原生雙指縮放（放大/縮小鈕＋拖曳僅桌機）→ `9359492`；手機隱藏整排工具列、完全回到原樣 → `12b6640`；桌機滾輪縮放（0.25 階、0.5～4 倍）→ `b2c8ba3`
- [x] 同步優化：照片只查無照片/簽名7天內到期單＋同單去重（`photoUrlsFresh`）；待認領自動帶入大發品項；matched 去重計數 → `8613545`
- [x] LINE 到貨通知（半自動）：全數到貨後按人分組，每人一封＋「分享到 LINE」＋複製文字；批次卡常駐按鈕可重開 → `96ac0d7`（全自動需官方帳號＋家人加好友，暫不做）
- [x] LINE 訊息改試算表費用格式：運費＝重×海快單價、人民幣＝費用＋運費、台幣＝×匯率四捨五入；單價/匯率面板可調（預設 10/4.75）；小計＋本批合計（25 筆實例驗算與試算表一致，合計 1328）→ `64b9c15`；每人＋整批 Excel 下載（欄位同試算表，單號存文字）→ `50f6f0d`；LINE 文字恢復簡單格式（品項＋單號＋總金額，Excel 保留）→ `1d9a831`
- [x] 大發備註欄（客户备注）導入、管理員可編輯待認領備註 → `aa95f43`
- [x] PWA（manifest/icons/app shell/更新提示）→ `8986f18`
- [x] 淘寶導入 bookmarklet v1（個人淘寶登入、帶入待認領）→ `537d100` → **已移除** `47fe982`
- [x] 淘寶導入改用**物流單號**＋**勾選清單**（可勾選要載入哪幾筆、自動跳過已存在）→ `63ba493` → **已移除** `47fe982`
- [x] 淘寶導入直接掛到**登入者名下**、品項截**前 10 字**、金額自動帶入（不再走待認領）→ `700fe57` → **已移除** `47fe982`
- [x] 大發同步：物品欄空白時自動從系統 records 補入同單號品項（已存在分支逆向補入，`rec.item` 有值且大發空白 → `update.item_name`）→ `d23b702` → **已還原** `232b044`（改做補預報）
- [x] 大發同步：**補預報**——大發已有單號但物品空白、且系統有姓名品項時，自動推預報（`backfillDafaPackages`，`save` 原地更新不重複；YT8898714396181 實測驗證）→ `70d1eb5`；預報單價 0/空白/無效一律送 5 → `dcb5311`；補預報條件擴大為品項空白**或單價 0/空白**（9823140468352 案例）→ `030bea2`
  - 背景：系統給家人朋友同事用，金額 0 表示沒用親情卡代付；**系統原值保留**（方便對帳），僅送大發申報時 0/空白改 5
- [x] 大發對接實測除錯（2026-11-02，唯讀驗證，未送任何預報）：
  - **分頁 off-by-one（真 bug）**：大發 `pageNum` 是 **1 起算**（`pageNum=0` 與 `1` 回同一頁），舊碼從 0 開始 → 第一頁重複、**最後一頁永遠抓不到**（實測會少 76 筆，2021-11～2023-08 的舊包裹）。現改為 1 起算＋以 `id` 去重＋`maxPage` 上限
  - **已集運包裹不再回推大發（真 bug）**：`toForecast` 原本只濾 `name && item`，已入批次（`batchId != null`）與已到貨的包裹仍會被預報。現改為 `name && item && batchId == null && !arrived`
  - **推送前逐一確認單號**：新增 `dafaFindPackage(no)`（`query/page-list` + `firstWaybillNo` 過濾，任何狀態都算），大發已有就跳過（`skipped`），查詢失敗也跳過避免誤推。因此不再需要抓全部 4000+ 筆比對（原本每次同步 21 次請求）
  - **補預報保留大發原備註**：`dafaForecastPayload(r, preferRemark)`，優先沿用大發 `customerRemark`，不再被系統姓名覆蓋
  - **補預報不再要求姓名**：只要系統 `rec.item` 有值就補（待認領也可補品項）
  - 實測數據（2026-11-02）：大發總 4076 筆（900 已發運 3986、500 揀貨完成 5、990 取消 3、130 中轉上架 2、700 裝箱完成 2、997 銷毀 1、110 預報入庫 1）；倉內僅 3 筆；系統 56 筆（54 已集運、2 待集運）


- [x] Bug 修正與順暢度（2026-11-05）：
  - 勾到貨／全數到貨沒有寫入 `arrived_at` → 重新整理後到貨時間消失，且沒有集運倉到貨日的包裹會顯示「未到貨」。現在所有到貨／退回動作都同步 `arrived_at`，狀態以 `arrived` 為優先
  - 批次名稱用 `batches.length + 1` 會撞號（刪掉舊批次後）→ 改為接續最大號 `nextBatchName()`
  - `importTbOrders` 呼叫不存在的分頁 `switchTab('pending')` → 改 `register`
  - 一般使用者不能刪除已入批次的包裹；批次刪除改成一次 `.in()` 請求
  - 輪詢／即時更新：資料沒變不重畫（`dataSig`）；正在輸入時延後重畫（備註打到一半不會被蓋掉）；畫面在背景不輪詢、回前景立即更新；`fetchAll` 三張表並行
  - Esc 關閉視窗／燈箱；`sw.js` cache → v9

## 待辦 🚧

- [ ] **安全性（下一步）**：`records`／`batches`／`settings` 仍是 `allow all` RLS，任何拿到 anon key 的人（repo 是公開的）都能讀寫刪；`settings.dafa_pass` 也讀得到。建議改成所有寫入都走需要 token 的 RPC，或改用 Supabase Auth
- [ ] 舊密碼與大發帳密曾出現在公開 repo 歷史中：家人登入後各自「修改密碼」；大發密碼建議到大發網站更換後在系統「儲存帳號」

- [ ] （新 session 持續開發的起點，見 handoff.md）
- [ ] 「采蕨」包裹確認：2026-08-15 查 Supabase records（order_no/name/item/remark）皆無此資料，應已不在系統；若大發倉庫端仍有測試包裹，下次 syncDafa 可能再被推播進待認領，屆時再處理
- [ ] RDQ 規格卡 `rdq/RDQ-spec-mobile-tb-import-20260815.md` 已 confirmed，但功能隨後全部移除（決策紀錄，供參考不執行）
- [ ] gh-pages 分支仍含 `tb-bookmarklet.js`、`tb-import-mobile.js`（本次未處理）；若要徹底清除可另開 session 處理

## 資料夾結構

- `index.html`：主系統（單檔 PWA，約 2300+ 行；包裹申報為單一表單，無淘寶導入）
- `sw.js`：Service Worker（v9）
- `supabase-migration-app-users.sql`：人員帳號與後台管理（人員初始資料 SQL 含密碼，**不放 repo**）
- `manifest.webmanifest` / `icon-192.png` / `icon-512.png` / `apple-touch-icon.png`：PWA 檔案
- `code.gs` / `supabase-*.sql`：AppScript 與 Supabase 遷移腳本
- `count_records.ps1`：單號統計腳本
- `rdq/`：RDQ 需求規格卡（決策紀錄）

## 關鍵架構資訊

- 大發帳號密碼：存在 Supabase `settings`（`dafa_user` / `dafa_pass`），**不要寫進 repo（repo 是公開的）**；shopId `896115513910222848`；倉庫 **`TMYT-PT`** 廈門漳州倉
- 大發 API：登入 `POST /siteapi/collectionSite/mall/portal/auth/login`（token 在 response header `authorization`）、查包裹 `POST /member-package/query/page-list`、預報 `POST /member-package/save?untransfer=true`、照片 `POST /member-package/queryImages`、倉庫 `TMYT-PT`
- **大發分頁 `pageNum` 為 1 起算**（`0` 與 `1` 回同一頁）；`pageSize` 上限可用 200；`query/page-list` 支援 `firstWaybillNo` 精準查單筆（跨所有狀態）；狀態碼：110 預報入庫、120 已入庫、130 中轉上架、500 揀貨完成、700 裝箱完成、900 已發運、990 取消、997 銷毀
- **大發刪除包裹 API**：`POST /member-package/remove`，body `{"ids":["<memberPackageId>"]}`（`ids` 才有效，`param`／`id` 會回「失败」）；`memberPackageId` 取自 `query/page-list` 的 `id`
- 大發 API 有開 CORS（`access-control-allow-origin` 回 GitHub Pages 網域），瀏覽器可直連
- Supabase：ref `nutkocotbncqxgvjkfxi`，records 表欄位為 snake_case（`order_no`）；系統內 JS 用 camelCase，靠 `recRow()` 轉換
- 使用者：存在 Supabase `app_users`（後台管理分頁維護）；初始為 俊賢、榮吉、小惠、Hebe、弟、妹、育源、武昌、曉君，管理員 武昌、曉君；`DEFAULT_NAMES` 只在連不上資料庫且無快取時顯示
- 登入：`USER_KEY='ts_user'` 存 `{name, admin, token}`；啟動時 `app_session(token)` 背景驗證（失效自動登出、同步管理員權限）；人員清單快取 `ts_staff_v1`
- 人員 RPC：`app_list_names`、`app_login`（失敗回 `{error}` 不 raise，避免錯誤次數被 rollback）、`app_session`、`app_logout`、`app_change_my_password`、`app_list_users`、`app_add_user`、`app_set_password`、`app_update_user`、`app_rename_user`、`app_move_user`、`app_delete_user`；`app_users`/`app_sessions` 開 RLS 無 policy，前端只能透過 RPC 存取
- 部署：master 與 gh-pages 無共同歷史；`git checkout master -- <files>` 同步→commit→push；用 `git rev-parse master:<f>` 比對 blob

## 注意事項 ⚠️

- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`
- file:// 下 fetch/XHR 受 CORS 限制無法導入（測試用 http.server 或 GitHub Pages https 即可）
- 大發第三方導入需桌面端「集運助手」，無法純 API 繞過（需使用者淘寶登入 session）
- 淘寶導入已全部移除；iOS Safari／Android Chrome 皆封鎖 `javascript:` 書籤與網址列（實測確認），手機自動帶入淘寶訂單不可行
- GitHub Pages 部署更新偶發延遲（CDN 快取）；可用 gh-pages 分支空 commit（`git commit --allow-empty -m "chore: trigger pages rebuild"`）觸發重新發布
- 包裹照片存於阿里雲廣州 OSS（`sztwms.oss-cn-guangzhou.aliyuncs.com`）；若照片全部無法顯示，先換網路測試（2026-09-10 實測：WiFi 不行、切 4G 正常，程式與資料皆無問題）
- Obsidian vault：`D:\ObsidianVault`（目前僅 welcome.md；L3 筆記待建立）