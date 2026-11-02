import { afterEach, describe, expect, it, vi } from 'vitest';
import { contact } from '../data/content';
import { failureMessage, sendEnquiry, validate, validateField } from '../lib/enquiry';

const e = contact.form.errors;

describe('validateField', () => {
  it.each([
    ['firstName', 'Asha'],
    ['firstName', 'Al'],
    ['firstName', "D'Souza"],
    ['firstName', 'Mary-Ann'],
    ['firstName', 'O’Brien'],
    ['firstName', 'José'],
    ['firstName', 'आशा'],
    ['lastName', 'S'],
    ['lastName', 'Mehta Shah'],
    ['email', 'asha@example.com'],
    ['email', 'first.last+tag@sub.example.co.in'],
    ['phone', ''],
    ['phone', '9876543210'],
    ['phone', '+91 98765-43210'],
    ['phone', '(022) 2345 6789'],
    ['phone', '+971 50 123 4567'],
    ['message', '1234567890'],
  ])('accepts %s "%s"', (name, value) => {
    expect(validateField(name, value)).toBeUndefined();
  });

  it.each([
    ['firstName', '', e.required],
    ['firstName', '   ', e.required],
    ['firstName', 'A', e.nameShort],
    ['firstName', 'A1', e.nameInvalid],
    ['firstName', '<b>x</b>', e.nameInvalid],
    ['lastName', 'Te5t', e.nameInvalid],
    ['lastName', '-Smith', e.nameInvalid],
    ['email', '', e.required],
    ['email', 'plainaddress', e.emailInvalid],
    ['email', 'asha@example', e.emailInvalid],
    ['email', 'a@b.c', e.emailInvalid],
    ['email', 'a b@c.com', e.emailInvalid],
    ['email', '@example.com', e.emailInvalid],
    ['phone', '123456789', e.phoneInvalid],
    ['phone', '1234567890123456', e.phoneInvalid],
    ['phone', 'call me', e.phoneInvalid],
    ['phone', '98765abc43', e.phoneInvalid],
    ['profile', '', e.required],
    ['message', '', e.required],
    ['message', '123456789', e.messageShort],
    ['message', '         x         ', e.messageShort],
  ])('rejects %s "%s"', (name, value, message) => {
    expect(validateField(name, value)).toBe(message);
  });

  it('treats an empty optional phone number as valid', () => {
    expect(validateField('phone', '   ')).toBeUndefined();
  });
});

describe('validate', () => {
  it('reports every invalid field and nothing for valid ones', () => {
    const out = validate({
      firstName: 'Asha',
      lastName: '',
      email: 'bad',
      phone: '',
      profile: 'Other',
      message: 'long enough message',
    });
    expect(Object.keys(out).sort()).toEqual(['email', 'lastName']);
  });
});

describe('failureMessage', () => {
  const f = contact.form.failures;
  afterEach(() => vi.unstubAllGlobals());

  it('says offline when the browser is offline', () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(failureMessage(new TypeError('Failed to fetch'))).toBe(f.offline);
  });

  it('says timeout for a TimeoutError', () => {
    expect(failureMessage(new DOMException('t', 'TimeoutError'))).toBe(f.timeout);
  });

  it('says network for a fetch TypeError', () => {
    expect(failureMessage(new TypeError('Failed to fetch'))).toBe(f.network);
  });

  it('says server for anything else, including undefined', () => {
    expect(failureMessage(new Error('Request failed: 500'))).toBe(f.server);
    expect(failureMessage(undefined)).toBe(f.server);
  });
});

describe('sendEnquiry payload integrity', () => {
  const values = {
    firstName: 'Jos�',
    lastName: "D'Souza",
    email: 'jose@example.com',
    phone: '',
    profile: 'Other',
    message: 'Need <b>staff</b> & "quotes" � ?????? ??? ? 100% + a=b&c=d',
  };
  afterEach(() => vi.restoreAllMocks());
  const form = { ...contact.form, sheetsEndpoint: 'https://script.google.com/macros/s/test/exec' };

  it('keeps Unicode, HTML characters and URL syntax intact in the Apps Script request', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    await sendEnquiry(values, form);
    const body = JSON.parse(spy.mock.calls[0][1].body);
    expect(body.message).toBe(values.message.trim());
    expect(body.name).toBe(`${values.firstName} ${values.lastName}`);
    expect(Object.keys(body).sort()).toEqual(
      ['company_website', 'email', 'message', 'name', 'phone', 'profile', 'submittedAt'].sort(),
    );
    expect(body.submittedAt).toMatch(/ IST$/);
  });

  it.each([
    ['ok false', () => new Response('{"ok":false,"error":"rate-limited"}', { status: 200 }), /rate-limited/],
    ['HTTP 500', () => new Response('{}', { status: 500 }), /500/],
  ])('rejects when the script answers %s', async (_, reply, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply());
    await expect(sendEnquiry(values, form)).rejects.toThrow(message);
  });
});
