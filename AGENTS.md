# 語言

- 一律使用繁體中文（Traditional Chinese）回覆使用者。
- 程式碼、變數名稱、指令輸出保持英文。

# 專案藍圖：淘寶集運管理系統（taobao-shipment）

## 目標

為家庭集運打造單頁系統（`index.html`，PWA），串接大發集運（df.omszt.com）：
- 每人登入後登錄自己的包裹（單號/品項/金額），管理員可建立集運批次、核對到貨
- **大發同步**：一鍵把大發倉庫包裹資料（重量/到貨/備註/照片）拉進來；把確認的包裹推成預報
- **淘寶訂單導入**：每位使用者用自己的淘寶帳號，用 bookmarklet 一鍵帶入物流單號/品項/金額，直接掛到自己名下

## 已完成 ✅

- [x] 基礎系統：登入（`ts_user` localStorage）、包裹登錄、待認領、批次、到貨核對、列印單
- [x] 大發登入＋一鍵同步（拉：重量/到貨/備註；推：預報 `member-package/save`）→ commit `3793b2e`
- [x] 大發照片同步（`queryImages`，縮圖＋燈箱）→ `066cb0e`
- [x] 大發備註欄（客户备注）導入、管理員可編輯待認領備註 → `aa95f43`
- [x] PWA（manifest/icons/app shell/更新提示）→ `8986f18`
- [x] 淘寶導入 bookmarklet v1（個人淘寶登入、帶入待認領）→ `537d100`
- [x] 淘寶導入改用**物流單號**＋**勾選清單**（可勾選要載入哪幾筆、自動跳過已存在）→ `63ba493`
- [x] 淘寶導入直接掛到**登入者名下**、品項截**前 10 字**、金額自動帶入（不再走待認領）→ `700fe57`

## 待辦 🚧

- [ ] （新 session 持續開發的起點，見 handoff.md）
- [ ] 待認領清單中「采蕨」包裹（真實淘寶導入測試留下）確認是否保留

## 資料夾結構

- `index.html`：主系統（單檔 PWA，約 2400+ 行，含淘寶導入卡片與 `importTbOrders`）
- `tb-bookmarklet.js`：淘寶導入 bookmarklet（`__BASE__` 由下載頁填入目前站台網址）；含 `showSelector` 勾選 UI
- `sw.js`：Service Worker（v4，APP_SHELL 含 tb-bookmarklet.js）
- `manifest.webmanifest` / `icon-192.png` / `icon-512.png` / `apple-touch-icon.png`：PWA 檔案
- `code.gs` / `supabase-*.sql`：AppScript 與 Supabase 遷移腳本
- `count_records.ps1`：單號統計腳本

## 關鍵架構資訊

- 大發帳號：`郭武昌168` / `123456`，shopId `896115513910222848`；倉庫 **`TMYT-PT`** 廈門漳州倉
- 大發 API：登入 `POST /siteapi/collectionSite/mall/portal/auth/login`（token 在 response header `authorization`）、查包裹 `POST /member-package/query/page-list`、預報 `POST /member-package/save?untransfer=true`、照片 `POST /member-package/queryImages`、倉庫 `TMYT-PT`
- Supabase：ref `nutkocotbncqxgvjkfxi`，records 表欄位為 snake_case（`order_no`）；系統內 JS 用 camelCase，靠 `recRow()` 轉換
- 使用者：`['俊賢','榮吉','小惠','Hebe','弟','妹','育源','武昌','曉君']`；管理員 `['武昌','曉君']`；`USER_KEY='ts_user'`
- 部署：master 與 gh-pages 無共同歷史；`git checkout master -- <files>` 同步→commit→push；用 `git rev-parse master:<f>` 比對 blob

## 注意事項 ⚠️

- 勿提交 `dafa_packages_20260812.xlsx`、`sensebar-agent-knowledge-vault-builder/`
- file:// 下 fetch/XHR 受 CORS 限制無法導入（測試用 http.server 或 GitHub Pages https 即可）
- bookmarklet 面板無法跨域查系統已有單號，已移除誤導標記；去重靠系統端 `importTbOrders` 跳過
- 大發第三方導入需桌面端「集運助手」，無法純 API 繞過（需使用者淘寶登入 session）
- Obsidian vault：`D:\ObsidianVault`（目前僅 welcome.md；L3 筆記待建立）