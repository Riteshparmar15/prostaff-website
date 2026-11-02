// No imports: also bundled into netlify/functions/submission-created.mjs

export const ENQUIRY_INBOX = 'adarsh.dubeyenterprises@gmail.com';
export const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${ENQUIRY_INBOX}`;

export function formatPhoneForEmail(phone) {
  if (!phone || phone === 'Not provided') return 'Not provided';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function enquirySubject(enquiry) {
  return `New website enquiry (${enquiry.profile}) — ${enquiry.name}`;
}

/** FormSubmit body that arrives in the inbox as a two-column table, one row per field. */
export function tableEmailPayload(enquiry) {
  return {
    'Full Name': enquiry.name,
    'Email Address': enquiry.email,
    'Phone Number': formatPhoneForEmail(enquiry.phone),
    'Enquiry Type': enquiry.profile,
    Message: enquiry.message,
    'Submitted On': enquiry.submittedAt,
    _subject: enquirySubject(enquiry),
    _replyto: enquiry.email,
    _template: 'table',
    _captcha: 'false',
  };
}
