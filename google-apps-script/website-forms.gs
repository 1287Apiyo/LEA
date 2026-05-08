const NOTIFY_EMAIL = "leaorganizationke@gmail.com";
const SPREADSHEET_NAME = "LEA Organization Website Form Responses";
const SPREADSHEET_ID_PROPERTY = "LEA_FORM_RESPONSES_SPREADSHEET_ID";

const FORM_CONFIG = {
  Volunteer: {
    sheetName: "Volunteers",
    columns: [
      ["Timestamp", "timestamp"],
      ["Full Name", "fullName"],
      ["Email Address", "email"],
      ["Phone Number", "phone"],
      ["Volunteer Area", "volunteerArea"],
      ["Availability", "availability"],
      ["Message", "message"],
    ],
  },
  Donate: {
    sheetName: "Donors",
    columns: [
      ["Timestamp", "timestamp"],
      ["Full Name", "fullName"],
      ["Email Address", "email"],
      ["Phone Number", "phone"],
      ["Donation Focus", "donationFocus"],
      ["Estimated Amount Or Support", "amount"],
      ["Message", "message"],
    ],
  },
  Contact: {
    sheetName: "Contact",
    columns: [
      ["Timestamp", "timestamp"],
      ["Full Name", "fullName"],
      ["Email Address", "email"],
      ["Phone Number", "phone"],
      ["Reason For Contact", "contactReason"],
      ["Message", "message"],
    ],
  },
  Partner: {
    sheetName: "Partners",
    columns: [
      ["Timestamp", "timestamp"],
      ["Organization Name", "organization"],
      ["Contact Person", "fullName"],
      ["Email Address", "email"],
      ["Phone Number", "phone"],
      ["Partnership Interest", "partnerArea"],
      ["Message", "message"],
    ],
  },
};

function doGet() {
  const spreadsheet = getOrCreateSpreadsheet_();
  return jsonResponse_({
    ok: true,
    message: "LEA Organization forms endpoint is live.",
    spreadsheetUrl: spreadsheet.getUrl(),
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const params = event && event.parameter ? event.parameter : {};
    const formType = normalizeFormType_(params.formType);
    const config = FORM_CONFIG[formType];
    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = getOrCreateSheet_(spreadsheet, config);
    const timestamp = new Date();
    const row = config.columns.map(([, key]) => (key === "timestamp" ? timestamp : params[key] || ""));

    sheet.appendRow(row);
    sendNotification_(formType, config, row, spreadsheet.getUrl());

    return jsonResponse_({
      ok: true,
      formType,
      sheetName: config.sheetName,
      spreadsheetUrl: spreadsheet.getUrl(),
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  } finally {
    lock.releaseLock();
  }
}

function normalizeFormType_(value) {
  const formType = String(value || "Contact").trim();
  return FORM_CONFIG[formType] ? formType : "Contact";
}

function getOrCreateSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(SPREADSHEET_ID_PROPERTY);

  if (existingId) {
    return SpreadsheetApp.openById(existingId);
  }

  const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  properties.setProperty(SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  Object.keys(FORM_CONFIG).forEach((formType) => getOrCreateSheet_(spreadsheet, FORM_CONFIG[formType]));

  const defaultSheet = spreadsheet.getSheets()[0];
  if (defaultSheet && defaultSheet.getName() === "Sheet1") {
    spreadsheet.deleteSheet(defaultSheet);
  }

  return spreadsheet;
}

function getOrCreateSheet_(spreadsheet, config) {
  let sheet = spreadsheet.getSheetByName(config.sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(config.sheetName);
  }

  const headers = config.columns.map(([header]) => header);
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some((cell) => String(cell).trim() !== "");

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#2c003e").setFontColor("#ffffff");
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

function sendNotification_(formType, config, row, spreadsheetUrl) {
  const lines = config.columns.map(([header], index) => `${header}: ${row[index] || ""}`);
  const subject = `New LEA ${formType} form submission`;
  const body = [
    `A new ${formType} form was submitted on the LEA Organization website.`,
    "",
    ...lines,
    "",
    `Spreadsheet: ${spreadsheetUrl}`,
  ].join("\n");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
