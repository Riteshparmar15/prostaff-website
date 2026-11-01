import { test, expect, fillValidEnquiry } from './fixtures';

const SUCCESS = "Thank you. We'll be in touch within 24 hours.";
const FAILURE = /Something went wrong/;

test.beforeEach(async ({ page }) => {
  await page.goto('./#contact');
});

test('empty submission shows errors, focuses the first field and sends nothing', async ({
  page,
  formMock,
}) => {
  const form = page.getByRole('form', { name: 'Contact form' });
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByLabel(/First Name/)).toBeFocused();
  await expect(form.getByLabel(/First Name/)).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(5);
  expect(formMock.submissions).toHaveLength(0);
});

test('rejects an invalid email address', async ({ page, formMock }) => {
  const form = await fillValidEnquiry(page);
  await form.getByLabel(/Email Address/).fill('qa@example');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByLabel(/Email Address/)).toHaveAttribute('aria-invalid', 'true');
  expect(formMock.submissions).toHaveLength(0);
});

test('valid enquiry is sent once, confirmed and the form resets', async ({ page, formMock }) => {
  formMock.delayMs = 800;
  const form = await fillValidEnquiry(page);
  const submit = form.getByRole('button', { name: 'Send Message' });
  await submit.dblclick();
  await expect(form.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  expect(formMock.submissions).toHaveLength(1);

  const body = formMock.submissions[0].postDataJSON();
  expect(body).toMatchObject({
    'Full Name': 'QA Automation',
    _replyto: 'qa.automation@example.com',
  });
  await expect(form.getByLabel(/First Name/)).toHaveValue('');
});

test('server error shows the failure message and keeps the input', async ({ page, formMock }) => {
  formMock.reply = { status: 500, json: { message: 'error' } };
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText(FAILURE)).toBeVisible();
  await expect(form.getByLabel(/First Name/)).toHaveValue('QA');
});

test('network failure shows the failure message', async ({ page, formMock }) => {
  formMock.reply = 'abort';
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText(FAILURE)).toBeVisible();
});

test('unactivated FormSubmit inbox is reported as a failure, not success', async ({
  page,
  formMock,
}) => {
  formMock.reply = { status: 200, json: { success: 'false', message: 'This form needs Activation.' } };
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText(FAILURE)).toBeVisible();
  await expect(form.getByRole('status')).toHaveCount(0);
});

test('a 200 reply that is not JSON is reported as a failure, not success', async ({
  page,
  formMock,
}) => {
  formMock.reply = { status: 200, body: '<html>Checking your browser…</html>', contentType: 'text/html' };
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText(FAILURE)).toBeVisible();
  await expect(form.getByRole('status')).toHaveCount(0);
  await expect(form.getByLabel(/First Name/)).toHaveValue('QA');
});

test('a request that never answers times out and re-enables the form', async ({
  page,
  formMock,
}) => {
  test.slow();
  formMock.reply = 'hang';
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(form.getByText(FAILURE)).toBeVisible({ timeout: 20_000 });
  await expect(form.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  await expect(form.getByLabel(/First Name/)).toHaveValue('QA');
});

test('payload matches the FormSubmit contract', async ({ page, formMock }) => {
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toBeVisible();

  const req = formMock.submissions[0];
  expect(req.method()).toBe('POST');
  expect(req.url()).toMatch(/^https:\/\/formsubmit\.co\/ajax\/[^/]+$/);
  expect(req.headers()['accept']).toBe('application/json');
  expect(req.postDataJSON()).toEqual({
    'Full Name': 'QA Automation',
    'Email Address': 'qa.automation@example.com',
    'Phone Number': 'Not provided',
    'Enquiry Type': 'Other',
    Message: 'Automated test enquiry. Please ignore.',
    'Submitted On': expect.stringMatching(/ IST$/),
    _subject: 'New website enquiry (Other) — QA Automation',
    _replyto: 'qa.automation@example.com',
    _template: 'table',
    _captcha: 'false',
  });
});

test('the form can be used again after a failure and after a success', async ({
  page,
  formMock,
}) => {
  formMock.reply = { status: 500, json: {} };
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText(FAILURE)).toBeVisible();

  formMock.reply = { status: 200, json: { success: 'true' } };
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  await expect(form.getByText(FAILURE)).toHaveCount(0);

  await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  expect(formMock.submissions).toHaveLength(3);
});
