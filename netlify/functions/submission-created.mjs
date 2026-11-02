// Netlify runs this after every verified (non-spam) Netlify Forms submission.
// Netlify's own notification email is plain text only, so the inbox copy is sent
// through FormSubmit's table template instead. Turn Netlify's email notification
// off in the dashboard, or every enquiry arrives twice.
import { FORMSUBMIT_URL, tableEmailPayload } from '../../src/lib/tableEmail.js';

const SITE = 'https://prostaffconsulting.com';

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');
  if (payload?.form_name !== 'enquiry') return { statusCode: 200, body: 'ignored' };

  const d = payload.data || {};
  const enquiry = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    profile: d.profile,
    message: d.message,
    submittedAt: d.submitted_at,
  };

  const res = await fetch(FORMSUBMIT_URL, {
    method: 'POST',
    // FormSubmit ties the inbox activation to the website that sends the form
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: SITE,
      Referer: `${SITE}/`,
    },
    body: JSON.stringify(tableEmailPayload(enquiry)),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || String(data.success) === 'false') {
    console.error('Table email failed', res.status, data);
    return { statusCode: 502, body: 'email failed' };
  }
  return { statusCode: 200, body: 'sent' };
};
