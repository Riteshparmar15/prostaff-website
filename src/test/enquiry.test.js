import { afterEach, describe, expect, it, vi } from 'vitest';
import { contact } from '../data/content';
import { failureMessage, validate, validateField } from '../lib/enquiry';
import { formatPhoneForEmail, tableEmailPayload } from '../lib/tableEmail';

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

  it('keeps Unicode, HTML characters and URL syntax intact through Netlify Forms', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const { sendEnquiry } = await import('../lib/enquiry');
    await sendEnquiry(values, { ...contact.form, netlifyForm: 'enquiry', sheetsEndpoint: null });
    const body = Object.fromEntries(new URLSearchParams(spy.mock.calls[0][1].body));
    expect(body.message).toBe(values.message.trim());
    expect(body.name).toBe("Jos� D'Souza");
    expect(Object.keys(body).sort()).toEqual(
      ['email', 'form-name', 'message', 'name', 'phone', 'profile', 'subject', 'submitted_at'].sort(),
    );
  });

  it('keeps them intact through the FormSubmit backup', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"success":"true"}', { status: 200 }));
    const { sendEnquiry } = await import('../lib/enquiry');
    await sendEnquiry(values, { ...contact.form, netlifyForm: null, emailjs: null, sheetsEndpoint: null });
    expect(JSON.parse(spy.mock.calls[0][1].body).Message).toBe(values.message.trim());
  });
});

describe('table email', () => {
  const enquiry = {
    name: 'Asha Mehta',
    email: 'asha@example.com',
    phone: '9876543210',
    profile: 'Employer / Brand',
    message: 'Need boutique staff in Dubai.',
    submittedAt: '2 Nov 2026, 2:26 pm IST',
  };
  afterEach(() => vi.restoreAllMocks());

  it('formats a 10-digit Indian number with a space', () => {
    expect(formatPhoneForEmail('9876543210')).toBe('98765 43210');
    expect(formatPhoneForEmail('919876543210')).toBe('+91 98765 43210');
    expect(formatPhoneForEmail('Not provided')).toBe('Not provided');
    expect(formatPhoneForEmail('+971 50 123 4567')).toBe('+971 50 123 4567');
  });

  it('builds one table row per field with the table template', () => {
    expect(tableEmailPayload(enquiry)).toEqual({
      'Full Name': 'Asha Mehta',
      'Email Address': 'asha@example.com',
      'Phone Number': '98765 43210',
      'Enquiry Type': 'Employer / Brand',
      Message: 'Need boutique staff in Dubai.',
      'Submitted On': '2 Nov 2026, 2:26 pm IST',
      _subject: 'New website enquiry (Employer / Brand) — Asha Mehta',
      _replyto: 'asha@example.com',
      _template: 'table',
      _captcha: 'false',
    });
  });

  it('after Netlify accepts, queues the table email as a keepalive form post without waiting for it', async () => {
    let finishEmail;
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
      url === '/'
        ? Promise.resolve(new Response('ok', { status: 200 }))
        : new Promise((resolve) => {
            finishEmail = resolve;
          }),
    );
    const { sendEnquiry } = await import('../lib/enquiry');
    await sendEnquiry(
      { firstName: 'Asha', lastName: 'Mehta', email: 'asha@example.com', phone: '9876543210', profile: 'Other', message: 'Need boutique staff.' },
      { ...contact.form, netlifyForm: 'enquiry', sheetsEndpoint: null },
    );
    expect(spy).toHaveBeenCalledTimes(2);
    const [url, init] = spy.mock.calls[1];
    expect(url).toBe(contact.form.endpoint);
    expect(init.keepalive).toBe(true);
    expect(init.headers).toEqual({ Accept: 'application/json' });
    const body = Object.fromEntries(init.body);
    expect(body._template).toBe('table');
    expect(body['Full Name']).toBe('Asha Mehta');
    expect(body['Phone Number']).toBe('98765 43210');
    finishEmail(new Response('{"success":"true"}', { status: 200 }));
  });
});
