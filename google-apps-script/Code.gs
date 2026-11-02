/**
 * Prostaff website enquiries -> Google Sheet + email notification.
 *
 * SETUP (one time, about 5 minutes, done from the Google account that should own the enquiries)
 *  1. Create a new Google Sheet, e.g. "Prostaff Website Enquiries".
 *  2. Extensions > Apps Script. Delete the sample code and paste this whole file. Save.
 *  3. Set NOTIFY_EMAIL below (leave '' to notify the account that owns the script).
 *  4. Deploy > New deployment > type "Web app".
 *       Execute as: Me        Who has access: Anyone
 *     Click Deploy and approve the permissions (Sheets + send email as you).
 *  5. Copy the Web app URL (ends in /exec) into the website's .env:
 *       VITE_SHEETS_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
 *     then rebuild and redeploy the website.
 *  6. Open the /exec URL in a browser: it should say {"ok":true,"service":"prostaff-enquiries"}.
 *
 * After editing this file later: Deploy > Manage deployments > Edit > Version: New version.
 * The URL stays the same.
 */

const NOTIFY_EMAIL = 'adarsh.dubeyenterprises@gmail.com'; // '' = the script owner's Gmail
const SEND_EMAIL = true;
const SHEET_NAME = 'Enquiries';
const PROFILES = ['Employer / Brand', 'Job Seeker / Candidate', 'Partnership Enquiry', 'Other'];
const LIMITS = { name: 120, email: 254, phone: 40, message: 5000 };
const MAX_PER_MINUTE = 20; // across all visitors
const MAX_PER_EMAIL_PER_HOUR = 5;
const HEADERS = ['Received (IST)', 'Name', 'Email', 'Phone', 'Enquiry Type', 'Message', 'Submitted On (visitor)'];

function doGet() {
  return json({ ok: true, service: 'prostaff-enquiries' });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ ok: false, error: 'invalid-json' });
  }

  // Honeypot: real visitors never fill this. Pretend success so bots learn nothing.
  if (data.company_website) return json({ ok: true });

  const enquiry = {
    name: clean(data.name, LIMITS.name),
    email: clean(data.email, LIMITS.email).toLowerCase(),
    phone: clean(data.phone, LIMITS.phone) || 'Not provided',
    profile: clean(data.profile, 40),
    message: clean(data.message, LIMITS.message),
    submittedAt: clean(data.submittedAt, 60),
  };

  if (!enquiry.name || !enquiry.message) return json({ ok: false, error: 'missing-fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(enquiry.email)) return json({ ok: false, error: 'invalid-email' });
  if (PROFILES.indexOf(enquiry.profile) === -1) return json({ ok: false, error: 'invalid-profile' });
  if (isRateLimited(enquiry.email)) return json({ ok: false, error: 'rate-limited' });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet();
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, HH:mm'),
      enquiry.name,
      enquiry.email,
      enquiry.phone,
      enquiry.profile,
      enquiry.message,
      enquiry.submittedAt,
    ].map(safeCell));
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'save-failed' });
  } finally {
    lock.releaseLock();
  }

  // The row is saved; a mail quota problem must not turn that into a failure
  if (SEND_EMAIL) {
    try {
      notify(enquiry);
    } catch (err) {
      console.error('Notification email failed', err);
    }
  }
  return json({ ok: true });
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function notify(enquiry) {
  const cell = 'padding:12px 16px;border:1px solid #E6DAC6;font-size:14px;line-height:1.5;vertical-align:top;';
  const rows = [
    ['Full Name', escapeHtml(enquiry.name)],
    ['Email Address', '<a href="mailto:' + escapeHtml(enquiry.email) + '" style="color:#9C7A4B;">' + escapeHtml(enquiry.email) + '</a>'],
    ['Phone Number', escapeHtml(enquiry.phone)],
    ['Enquiry Type', escapeHtml(enquiry.profile)],
    ['Message', '<span style="white-space:pre-wrap;">' + escapeHtml(enquiry.message) + '</span>'],
    ['Submitted On', escapeHtml(enquiry.submittedAt)],
  ]
    .map(([label, value], i) =>
      '<tr style="background:' + (i % 2 ? '#FFFFFF' : '#FBF8F3') + ';">' +
      '<td style="' + cell + 'width:150px;font-weight:bold;color:#6F6A62;">' + label + '</td>' +
      '<td style="' + cell + 'color:#1B1B1F;">' + value + '</td></tr>')
    .join('');

  const html =
    '<div style="margin:0;padding:24px 12px;background:#F4EFE6;font-family:Arial,Helvetica,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E6DAC6;border-collapse:collapse;">' +
    '<tr><td style="background:#0F1115;padding:24px 28px;">' +
    '<div style="font-family:Georgia,serif;font-size:24px;letter-spacing:2px;color:#C9A96E;">PROSTAFF</div>' +
    '<div style="margin-top:4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#E6DAC6;">New Website Enquiry</div>' +
    '</td></tr>' +
    '<tr><td style="padding:24px 28px 8px;font-size:14px;color:#1B1B1F;">' +
    'A new enquiry was submitted on <a href="https://prostaffconsulting.com" style="color:#9C7A4B;">prostaffconsulting.com</a>. Details below:' +
    '</td></tr>' +
    '<tr><td style="padding:12px 28px 24px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' +
    '<tr><th align="left" style="' + cell + 'background:#C9A96E;color:#0F1115;">Field</th>' +
    '<th align="left" style="' + cell + 'background:#C9A96E;color:#0F1115;">Details</th></tr>' +
    rows +
    '</table></td></tr>' +
    '<tr><td style="padding:16px 28px;background:#FBF8F3;border-top:1px solid #E6DAC6;font-size:12px;color:#6F6A62;">' +
    'Reply to this email to respond to ' + escapeHtml(enquiry.name) + '. A copy is saved in the "' + SHEET_NAME + '" Google Sheet.<br>' +
    'Prostaff · A Division of Dubey Enterprises' +
    '</td></tr></table></div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(),
    replyTo: enquiry.email,
    name: 'Prostaff Website',
    subject: 'New website enquiry (' + enquiry.profile + ') — ' + enquiry.name,
    htmlBody: html,
    body:
      'New website enquiry\n\nFull Name: ' + enquiry.name + '\nEmail Address: ' + enquiry.email +
      '\nPhone Number: ' + enquiry.phone + '\nEnquiry Type: ' + enquiry.profile +
      '\nMessage: ' + enquiry.message + '\nSubmitted On: ' + enquiry.submittedAt,
  });
}

function isRateLimited(email) {
  const cache = CacheService.getScriptCache();
  const minuteKey = 'rate:' + Math.floor(Date.now() / 60000);
  const emailKey = 'email:' + email;
  const minuteCount = Number(cache.get(minuteKey) || 0);
  const emailCount = Number(cache.get(emailKey) || 0);
  if (minuteCount >= MAX_PER_MINUTE || emailCount >= MAX_PER_EMAIL_PER_HOUR) return true;
  cache.put(minuteKey, String(minuteCount + 1), 120);
  cache.put(emailKey, String(emailCount + 1), 3600);
  return false;
}

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

// Stops values such as "=HYPERLINK(...)" being run as spreadsheet formulas
function safeCell(value) {
  const s = String(value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
