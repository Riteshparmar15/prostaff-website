import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { beforeEach, describe, expect, it } from 'vitest';

const SOURCE = readFileSync(resolve(process.cwd(), 'google-apps-script/Code.gs'), 'utf8');

function loadScript() {
  const rows = [];
  const mails = [];
  const cache = new Map();
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (r) => rows.push(r),
    setFrozenRows: () => {},
    getRange: () => ({ setFontWeight: () => {} }),
  };
  const ctx = {
    console: { error: () => {} },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet }) },
    MailApp: { sendEmail: (m) => mails.push(m) },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'owner@example.com' }) },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    CacheService: {
      getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }),
    },
    Utilities: { formatDate: () => '01 Nov 2026, 10:00' },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE, ctx);
  const post = (body) =>
    JSON.parse(ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).text);
  return { ctx, rows, mails, post };
}

const valid = {
  name: 'Asha Mehta',
  email: 'Asha@Example.com',
  phone: '+91 98765 43210',
  profile: 'Employer / Brand',
  message: 'We need boutique staff.',
  submittedAt: '1 Nov 2026, 10:00 am IST',
  company_website: '',
};

describe('Google Apps Script enquiry endpoint', () => {
  let s;
  beforeEach(() => {
    s = loadScript();
  });

  it('answers the health check', () => {
    expect(JSON.parse(s.ctx.doGet().text)).toEqual({ ok: true, service: 'prostaff-enquiries' });
  });

  it('saves a valid enquiry under a header row and emails the owner', () => {
    expect(s.post(valid)).toEqual({ ok: true });
    expect(s.rows[0][0]).toBe('Received (IST)');
    expect(s.rows[1]).toEqual([
      '01 Nov 2026, 10:00',
      'Asha Mehta',
      'asha@example.com',
      "'+91 98765 43210",
      'Employer / Brand',
      'We need boutique staff.',
      '1 Nov 2026, 10:00 am IST',
    ]);
    expect(s.mails).toHaveLength(1);
    expect(s.mails[0]).toMatchObject({
      to: 'adarsh.dubeyenterprises@gmail.com',
      replyTo: 'asha@example.com',
      subject: 'New website enquiry (Employer / Brand) — Asha Mehta',
    });
  });

  it('emails every form field as a row of a two-column table', () => {
    s.post(valid);
    const html = s.mails[0].htmlBody;
    expect(html).toContain('>Field</th>');
    expect(html).toContain('>Details</th>');
    [
      ['Full Name', 'Asha Mehta'],
      ['Email Address', 'asha@example.com'],
      ['Phone Number', '+91 98765 43210'],
      ['Enquiry Type', 'Employer / Brand'],
      ['Message', 'We need boutique staff.'],
      ['Submitted On', '1 Nov 2026, 10:00 am IST'],
    ].forEach(([label, value]) => {
      expect(html).toMatch(new RegExp(`>${label}</td><td[^>]*>(<[^>]+>)*${value.replace(/[+/]/g, '\\$&')}`));
    });
    expect(s.mails[0].body).toContain('Full Name: Asha Mehta');
  });

  it('silently ignores honeypot submissions', () => {
    expect(s.post({ ...valid, company_website: 'spam.example' })).toEqual({ ok: true });
    expect(s.rows).toHaveLength(0);
    expect(s.mails).toHaveLength(0);
  });

  it.each([
    ['invalid JSON', 'not json', 'invalid-json'],
    ['missing message', { ...valid, message: '   ' }, 'missing-fields'],
    ['invalid email', { ...valid, email: 'asha@example' }, 'invalid-email'],
    ['unknown profile', { ...valid, profile: 'Hacker' }, 'invalid-profile'],
  ])('rejects %s', (_, body, error) => {
    expect(s.post(body)).toEqual({ ok: false, error });
    expect(s.rows).toHaveLength(0);
  });

  it('neutralises spreadsheet formulas', () => {
    s.post({ ...valid, name: '=HYPERLINK("http://evil","x")', message: '@SUM(A1)' });
    expect(s.rows[1][1]).toBe('\'=HYPERLINK("http://evil","x")');
    expect(s.rows[1][5]).toBe("'@SUM(A1)");
  });

  it('escapes HTML in the notification email', () => {
    s.post({ ...valid, message: '<script>alert(1)</script>' });
    expect(s.mails[0].htmlBody).toContain('&lt;script&gt;');
    expect(s.mails[0].htmlBody).not.toContain('<script>');
  });

  it('caps field lengths', () => {
    s.post({ ...valid, message: 'x'.repeat(9000) });
    expect(s.rows[1][5]).toHaveLength(5000);
  });

  it('rate-limits repeated enquiries from one email address', () => {
    for (let i = 0; i < 5; i++) expect(s.post(valid).ok).toBe(true);
    expect(s.post(valid)).toEqual({ ok: false, error: 'rate-limited' });
  });

  it('keeps the saved row when the notification email fails', () => {
    s.ctx.MailApp.sendEmail = () => {
      throw new Error('quota');
    };
    expect(s.post(valid)).toEqual({ ok: true });
    expect(s.rows).toHaveLength(2);
  });
});
