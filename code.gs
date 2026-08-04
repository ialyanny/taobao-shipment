var SPREADSHEET_ID = '1WX6Zu6b1JjVBpKKgvdARnRdRwbFXudEmQX0y7qGPPXw';
var SHEET_NAME = '集運單';

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['時間', '姓名', '單號', '品項', '金額']);
  }
  return sheet;
}

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'get') {
    return ContentService.createTextOutput(JSON.stringify(fetchRecords_())).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  if (action === 'add') {
    return ContentService.createTextOutput(JSON.stringify(addRecord_(data))).setMimeType(ContentService.MimeType.JSON);
  }
  if (action === 'delete') {
    return ContentService.createTextOutput(JSON.stringify(deleteRecord_(data.row))).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unknown action' })).setMimeType(ContentService.MimeType.JSON);
}

function fetchRecords_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    records.push({
      time: row[0] instanceof Date ? row[0].getTime() : row[0],
      name: row[1],
      orderNo: String(row[2]),
      item: row[3],
      amount: String(row[4]),
      row: i + 1
    });
  }
  return { ok: true, records: records };
}

function addRecord_(data) {
  var sheet = getSheet_();
  var time = new Date();
  sheet.appendRow([time, data.name, data.orderNo, data.item, data.amount]);
  return fetchRecords_();
}

function deleteRecord_(rowNum) {
  if (!rowNum || rowNum < 2) return { ok: false, error: 'invalid row' };
  var sheet = getSheet_();
  sheet.deleteRow(rowNum);
  return fetchRecords_();
}

function uploadToGoogleDrive() {
  var folderName = '淘寶集運資料夾';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  var files = [
    { name: 'index.html', content: HtmlService.createHtmlOutputFromFile('index').getContent() },
    { name: 'code.gs', content: CodeApp.getService().getCode() }
  ];

  files.forEach(function (f) {
    var existing = folder.getFilesByName(f.name);
    if (existing.hasNext()) {
      existing.next().setContent(f.content);
    } else {
      folder.createFile(f.name, f.content, MimeType.PLAIN_TEXT);
    }
  });

  return { ok: true, folderUrl: folder.getUrl() };
}

/**
 * 從原試算表的「表單回應 1」工作表匯入資料到「集運單」工作表
 * 執行一次即可：選單「執行」→「importFromSourceSheet」
 */
function importFromSourceSheet() {
  var sourceId = '1WX6Zu6b1JjVBpKKgvdARnRdRwbFXudEmQX0y7qGPPXw';
  var sourceSs = SpreadsheetApp.openById(sourceId);
  var sourceSheet = sourceSs.getSheetByName('表單回應 1');
  if (!sourceSheet) {
    throw new Error('找不到來源工作表「表單回應 1」');
  }

  var targetSheet = getSheet_();
  // 清空現有資料（保留標題列）
  var lastRow = targetSheet.getLastRow();
  if (lastRow > 1) {
    targetSheet.deleteRows(2, lastRow - 1);
  }

  var sourceValues = sourceSheet.getDataRange().getValues();
  // CSV 欄位：時間戳記, 單號, 品項, 金額, 姓名
  // 目標欄位：時間, 姓名, 單號, 品項, 金額

  var toAppend = [];
  for (var i = 1; i < sourceValues.length; i++) {
    var row = sourceValues[i];
    var time = row[0];   // 時間戳記
    var orderNo = String(row[1] || '').trim();
    var item = row[2];
    var amount = row[3];
    var name = String(row[4] || '').trim();

    if (!orderNo) continue; // 跳過空單號
    toAppend.push([time, name, orderNo, item, amount]);
  }

  if (toAppend.length > 0) {
    targetSheet.getRange(targetSheet.getLastRow() + 1, 1, toAppend.length, 5).setValues(toAppend);
  }

  Logger.log('匯入完成：' + toAppend.length + ' 筆');
  return { ok: true, imported: toAppend.length };
}

/** 快速檢查目標工作表資料筆數 */
function checkTargetCount() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  Logger.log('目前資料筆數（含標題）：' + values.length);
  return values.length - 1;
}