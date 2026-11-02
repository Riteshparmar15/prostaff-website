import { contact } from '../data/content';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const PHONE_CHARS_RE = /^\+?[\d\s()-]+$/;

export const REQUIRED = ['firstName', 'lastName', 'email', 'profile', 'message'];
export const LIMITS = { name: 50, email: 254, phone: 20, messageMin: 10, message: 2000 };
export const HONEYPOT = 'company_website';

// Apps Script saves the row and sends the email before it replies; a cold start can take several seconds
const REQUEST_TIMEOUT = 20000;

/** Returns the error message for one field, or undefined when the value is acceptable. */
export function validateField(name, rawValue) {
  const { errors } = contact.form;
  const value = rawValue.trim();
  if (!value) return REQUIRED.includes(name) ? errors.required : undefined;

  switch (name) {
    case 'firstName':
    case 'lastName':
      // A surname written as an initial is common ("Raman S"), so only the first name needs 2 letters
      if (name === 'firstName' && value.length < 2) return errors.nameShort;
      if (!NAME_RE.test(value)) return errors.nameInvalid;
      return undefined;
    case 'email':
      return EMAIL_RE.test(value) ? undefined : errors.emailInvalid;
    case 'phone': {
      const digits = value.replace(/\D/g, '').length;
      return PHONE_CHARS_RE.test(value) && digits >= 10 && digits <= 15
        ? undefined
        : errors.phoneInvalid;
    }
    case 'message':
      return value.length < LIMITS.messageMin ? errors.messageShort : undefined;
    default:
      return undefined;
  }
}

export function validate(values) {
  const out = {};
  Object.keys(values).forEach((key) => {
    const error = validateField(key, values[key]);
    if (error) out[key] = error;
  });
  return out;
}

export function buildEnquiry(values) {
  return {
    name: `${values.firstName.trim()} ${values.lastName.trim()}`,
    email: values.email.trim(),
    phone: values.phone.trim() || 'Not provided',
    profile: values.profile,
    message: values.message.trim(),
    submittedAt: `${new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    })} IST`,
  };
}

/**
 * Sends the enquiry to the Google Apps Script web app (google-apps-script/Code.gs), which adds a row
 * to the Google Sheet and emails it to the inbox as a table. Resolves only once the script confirms.
 */
export async function sendEnquiry(values, form = contact.form) {
  if (!form.sheetsEndpoint) throw new Error('Google Apps Script URL is not set (contact.form.sheetsEndpoint)');
  const res = await fetch(form.sheetsEndpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    // text/plain keeps this a simple CORS request; Apps Script cannot answer preflight requests
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...buildEnquiry(values), [HONEYPOT]: '' }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok !== true) {
    throw new Error(`Google Apps Script: ${data?.error || `request failed (${res.status})`}`);
  }
}

/** Picks the visitor-facing failure message for an error thrown by sendEnquiry. */
export function failureMessage(err) {
  const { failures } = contact.form;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return failures.offline;
  if (err?.name === 'TimeoutError') return failures.timeout;
  if (err instanceof TypeError) return failures.network;
  return failures.server;
}
