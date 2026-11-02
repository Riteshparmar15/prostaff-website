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

const NOTIFY_EMAIL = ''; // '' = the script owner's Gmail
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
  const rows = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone],
    ['Enquiry Type', enquiry.profile],
    ['Message', enquiry.message],
    ['Submitted On', enquiry.submittedAt],
  ]
    .map(([k, v]) => '<tr><th align="left" style="padding:6px 12px">' + k + '</th><td style="padding:6px 12px;white-space:pre-wrap">' + escapeHtml(v) + '</td></tr>')
    .join('');
  MailApp.sendEmail({
    to: NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(),
    replyTo: enquiry.email,
    subject: 'New website enquiry (' + enquiry.profile + ') — ' + enquiry.name,
    htmlBody: '<p>New enquiry from the Prostaff website (saved to Google Sheets):</p><table>' + rows + '</table>',
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
