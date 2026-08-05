# Google Sheets 連接步驟（Apps Script Web App）

讓「淘寶集運單」網站多人共用同一份 Google 試算表資料。

## 前置需求

- 一個 Google 帳號（擁有你的試算表）
- 試算表：`淘寶集運單new0209 - 表單回應 1`（或其副本）

## 步驟

### 1. 建立 Apps Script 專案

1. 開啟 https://script.google.com 點「新專案」
2. 把專案改名（例：`淘寶集運單後端`）
3. 打開左側「編輯器」的 `Code.gs`，**全部刪除**後貼上 `code.gs` 的內容

### 2. 指定要連接的試算表

在 `code.gs` 頂部：

```javascript
var SPREADSHEET_ID = ''; // ← 填入你的試算表 ID
```

試算表 ID 就是網址中間那段：`docs.google.com/spreadsheets/d/【這裡】/edit`

例如：`1WX6Zu6b1JjVBpKKgvdARnRdRwbFXudEmQX0y7qGPPXw`

> 也可留空，則使用 Apps Script 本身所屬的試算表。

### 3. 執行一次觸發授權

1. 上方工具列選 `getSheet` 函數
2. 點「執行」
3. 跳出授權視窗 → 選你的 Google 帳號 → 顯示「Google 尚未驗證」時點「進階」→「前往（不安全）」→「允許」

> 完成後試算表會多一個名為「集運單」的工作表。

### 4. 部署為 Web App

1. 右上角點「**部署**」→「**新型部署**」
2. 類型選「**Web 應用程式**」
3. 設定：
   - **說明**：`v1`
   - **執行身分**：`我（你的Google帳號）`
   - **誰能存取**：`任何擁有連結的人`
4. 點「部署」，第一次會跳出授權，同意後即可
5. **複製 Web App 網址**（形如 `https://script.google.com/macros/s/xxxx/exec`）

### 5. 填入前端

開啟 `C:\opencode0804\index.html`，找到：

```javascript
var API_URL = '';
```

把 Web App 網址貼進去：

```javascript
var API_URL = 'https://script.google.com/macros/s/xxxx/exec';
```

重新整理網頁，即可多人共用試算表資料。

## 驗證是否成功

- 網頁載入後，提交記錄應顯示試算表「集運單」工作表的內容
- 提交一筆 → 到 Google 試算表「集運單」工作表應看到新列
- 兩個不同瀏覽器開啟網頁，都能看到同一份資料

## 安全提醒

- Web App 設為「任何擁有連結的人」= 知道網址的人都能讀寫。若僅自己人使用，可改為「你的組織」或配合存取控制
- 若要關閉後端：Apps Script 專案 → 部署 → 停用

## 排錯

| 問題 | 解法 |
|------|------|
| 網頁顯示「連線失敗」 | 確認 `API_URL` 是否貼對、Web App 是否已部署且為最新版本（部署→管理部署→編輯→新版本） |
| 403 / 需要授權 | 執行身分沒設成「我」；或使用者被擋（權限設為任何擁有連結者即可） |
| 提交後試算表沒新增 | 確認「集運單」工作表存在；重新部署 Web App |
| 改動 code.gs 後沒生效 | 必須重新部署（部署→管理部署→編輯→「版本」選新版本） |
