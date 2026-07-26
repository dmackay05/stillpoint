/**
 * Stillpoint — Apps Script backend
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the resulting /exec URL into Stillpoint Settings:
 *   - "Google Sheets Sync URL" -> the exec URL as-is (used for POST / write)
 *   - "Sheet Read URL"         -> the exec URL as-is (used for GET / JSONP read)
 */

const SHEET_NAME = "Sessions";
const HEADERS = ["id", "sessionId", "title", "category", "minutes", "date"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

// Handle POST from the app (new session logged)
function doPost(e) {
  const sheet = getSheet_();
  const p = e.parameter || {};

  // Avoid duplicate rows if the same entry gets synced twice
  if (p.id) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(p.id)) {
        return ContentService.createTextOutput(JSON.stringify({ status: "duplicate" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  sheet.appendRow([
    p.id || "",
    p.sessionId || "",
    p.title || "",
    p.category || "",
    p.minutes || "",
    p.date || new Date().toISOString()
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle GET from the app (pulling history back down, JSONP-wrapped)
function doGet(e) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).map(row => {
    const obj = {};
    HEADERS.forEach((key, i) => { obj[key] = row[i]; });
    obj.minutes = Number(obj.minutes) || 0;
    return obj;
  });

  const callback = e.parameter.callback;
  const json = JSON.stringify(rows);
  const output = callback ? `${callback}(${json})` : json;

  return ContentService.createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
