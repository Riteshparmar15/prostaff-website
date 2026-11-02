import { contact } from '../data/content';
import { enquirySubject, tableEmailPayload } from './tableEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const PHONE_CHARS_RE = /^\+?[\d\s()-]+$/;

export const REQUIRED = ['firstName', 'lastName', 'email', 'profile', 'message'];
export const LIMITS = { name: 50, email: 254, phone: 20, messageMin: 10, message: 2000 };
export const HONEYPOT = 'company_website';

// Netlify answers in well under a second, so a slow reply means it is better to hand over to the backup
const NETLIFY_TIMEOUT = 8000;
// FormSubmit sends the email before it replies, which regularly takes about 10 seconds
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

/** Resolves as soon as one delivery channel confirms the enquiry; rejects only when every channel fails. */
export async function sendEnquiry(values, form = contact.form) {
  const enquiry = buildEnquiry(values);
  const channels = [sendPrimary(enquiry, form)];
  if (form.sheetsEndpoint) channels.push(sendViaGoogleSheets(enquiry, form.sheetsEndpoint));
  channels.forEach((p) => p.catch((err) => console.warn('Enquiry channel failed:', err)));
  try {
    await Promise.any(channels);
  } catch (err) {
    throw err.errors[0];
  }
}

async function sendPrimary(enquiry, form) {
  if (form.netlifyForm) {
    try {
      await sendViaNetlify(enquiry, form.netlifyForm);
      queueTableEmail(enquiry, form.endpoint);
      return;
    } catch (err) {
      console.warn('Netlify Forms failed, using the backup channel:', err);
    }
  }
  return form.emailjs ? sendViaEmailJS(enquiry, form.emailjs) : sendViaFormEndpoint(enquiry, form.endpoint);
}

async function sendViaNetlify(enquiry, formName) {
  const res = await fetch('/', {
    method: 'POST',
    signal: AbortSignal.timeout(NETLIFY_TIMEOUT),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'form-name': formName,
      subject: enquirySubject(enquiry),
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      profile: enquiry.profile,
      message: enquiry.message,
      submitted_at: enquiry.submittedAt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Netlify Forms: request failed (${res.status})`);
}

// Netlify's notification email is plain text, so the inbox copy is FormSubmit's table email.
// It can take over a minute: keepalive lets it finish after the visitor leaves the page, and a
// form-encoded body with only safelisted headers avoids the CORS preflight keepalive cannot do.
function queueTableEmail(enquiry, endpoint) {
  fetch(endpoint, {
    method: 'POST',
    keepalive: true,
    headers: { Accept: 'application/json' },
    body: new URLSearchParams(tableEmailPayload(enquiry)),
  }).catch((err) => console.warn('Table email failed:', err));
}

async function sendViaGoogleSheets(enquiry, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    // text/plain keeps this a simple CORS request; Apps Script cannot answer preflight requests
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...enquiry, [HONEYPOT]: '' }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok !== true) {
    throw new Error(`Google Sheets: ${data?.error || `request failed (${res.status})`}`);
  }
}

async function sendViaEmailJS(enquiry, { serviceId, templateId, publicKey }) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        ...enquiry,
        submitted_at: enquiry.submittedAt,
        reply_to: enquiry.email,
      },
    }),
  });
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
}

async function sendViaFormEndpoint(enquiry, endpoint) {
  // Accept header makes FormSubmit / Formspree / Getform reply with JSON instead of redirecting
  const res = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(tableEmailPayload(enquiry)),
  });
  // FormSubmit answers 200 with { success: "false" } when the inbox is not yet activated.
  // A non-JSON 200 (proxy, captive portal or challenge page) is not proof of delivery.
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
