import { test, expect, fillValidEnquiry } from './fixtures';

const SUCCESS = "Thank you. We'll be in touch within 24 hours.";
const FAILURE = /Message not sent/;

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

  const body = JSON.parse(formMock.submissions[0].postData());
  expect(body).toMatchObject({ name: 'QA Automation', email: 'qa.automation@example.com' });
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
  await expect(form.getByText(/check your internet connection/)).toBeVisible();
});

test('an Apps Script error reply is reported as a failure, not success', async ({
  page,
  formMock,
}) => {
  formMock.reply = { status: 200, json: { ok: false, error: 'save-failed' } };
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
  await expect(form.getByText(FAILURE)).toBeVisible({ timeout: 30_000 });
  await expect(form.getByText(/took too long/)).toBeVisible();
  await expect(form.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  await expect(form.getByLabel(/First Name/)).toHaveValue('QA');
});

test('payload matches the Google Apps Script contract', async ({ page, formMock }) => {
  const form = await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toBeVisible();

  const req = formMock.submissions[0];
  expect(req.method()).toBe('POST');
  expect(req.url()).toMatch(/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/);
  expect(req.headers()['content-type']).toBe('text/plain;charset=utf-8');
  expect(JSON.parse(req.postData())).toEqual({
    name: 'QA Automation',
    email: 'qa.automation@example.com',
    phone: 'Not provided',
    profile: 'Other',
    message: 'Automated test enquiry. Please ignore.',
    submittedAt: expect.stringMatching(/ IST$/),
    company_website: '',
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

  formMock.reply = { status: 200, json: { ok: true } };
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  await expect(form.getByText(FAILURE)).toHaveCount(0);

  await fillValidEnquiry(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  expect(formMock.submissions).toHaveLength(3);
});

test('one click on Send right after typing an invalid value shows the errors (blur validation must not swallow the click)', async ({
  page,
  formMock,
}) => {
  const form = page.getByRole('form', { name: 'Contact form' });
  await form.getByLabel(/Message/).fill('Hi');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText('Please correct the 5 highlighted fields.')).toBeVisible();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(5);
  expect(formMock.submissions).toHaveLength(0);
});

test('one click on Send right after typing a valid last field sends the enquiry once', async ({
  page,
  formMock,
}) => {
  const form = await fillValidEnquiry(page);
  await form.getByLabel(/Phone/).fill('abc');
  await form.getByLabel(/Phone/).fill('9876543210');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByRole('status')).toContainText(SUCCESS);
  expect(formMock.submissions).toHaveLength(1);
});
