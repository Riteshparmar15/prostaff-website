import { contact } from '../data/content';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const PHONE_CHARS_RE = /^\+?[\d\s()-]+$/;

export const REQUIRED = ['firstName', 'lastName', 'email', 'profile', 'message'];
export const LIMITS = { name: 50, email: 254, phone: 20, messageMin: 10, message: 2000 };
export const HONEYPOT = 'company_website';

// Netlify accepts the enquiry in well under a second and emails the inbox itself
const NETLIFY_TIMEOUT = 8000;
// FormSubmit is only the local fallback; it sends the email before it replies
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

/** On the live site this returns as soon as Netlify accepts it, which is under a second. */
export async function sendEnquiry(values, form = contact.form) {
  const enquiry = buildEnquiry(values);
  if (form.netlifyForm) return sendViaNetlify(enquiry, form.netlifyForm);
  return sendViaFormSubmit(enquiry, form.endpoint);
}

async function sendViaNetlify(enquiry, formName) {
  const res = await fetch('/', {
    method: 'POST',
    signal: AbortSignal.timeout(NETLIFY_TIMEOUT),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'form-name': formName,
      subject: `New website enquiry (${enquiry.profile}) — ${enquiry.name}`,
      email: enquiry.email,
      'Full Name': enquiry.name,
      'Email Address': enquiry.email,
      'Phone Number': enquiry.phone,
      'Enquiry Type': enquiry.profile,
      Message: enquiry.message,
      'Submitted On': enquiry.submittedAt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Netlify Forms: request failed (${res.status})`);
}

async function sendViaFormSubmit(enquiry, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      'Full Name': enquiry.name,
      'Email Address': enquiry.email,
      'Phone Number': enquiry.phone,
      'Enquiry Type': enquiry.profile,
      Message: enquiry.message,
      'Submitted On': enquiry.submittedAt,
      _subject: `New website enquiry (${enquiry.profile}) — ${enquiry.name}`,
      _replyto: enquiry.email,
      _template: 'table',
      _captcha: 'false',
    }),
  });
  // FormSubmit answers 200 with { success: "false" } when the inbox is not yet activated.
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || String(data.success) === 'false') {
    throw new Error(data?.message || `Request failed: ${res.status}`);
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
