import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { company, contact, industries, testimonials } from '../data/content';

describe('page structure', () => {
  it('has exactly one h1', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows each headline section heading once', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { name: industries.title })).toHaveLength(1);
  });

  it('shows the key statistics only once', () => {
    render(<App />);
    expect(screen.getAllByText('Candidates Placed')).toHaveLength(1);
  });

  it('lists the roles for every industry', () => {
    render(<App />);
    industries.items.forEach((item) => {
      expect(
        screen.getByRole('button', { name: `${item.name}: ${item.roles.join(', ')}` }),
      ).toBeInTheDocument();
    });
  });

  it('renders every testimonial', () => {
    render(<App />);
    testimonials.items.forEach((t) => {
      expect(screen.getByText(`“${t.quote}”`)).toBeInTheDocument();
    });
  });
});

describe('hero', () => {
  const heroSection = () => screen.getByRole('region', { name: /Connecting/ });

  it('leaves the sectors to the Industries section', () => {
    render(<App />);
    industries.items.forEach((item) => {
      expect(within(heroSection()).queryByText(item.name)).not.toBeInTheDocument();
    });
  });

  it('toggles the background slideshow between pause and play', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Pause background slideshow' }));
    expect(screen.getByRole('button', { name: 'Play background slideshow' })).toBeInTheDocument();
  });
});

describe('contact form', () => {
  const form = () => screen.getByRole('form', { name: 'Contact form' });

  const fillValid = async (user) => {
    const f = within(form());
    await user.type(f.getByLabelText(/First Name/), 'Asha');
    await user.type(f.getByLabelText(/Last Name/), 'Mehta');
    await user.type(f.getByLabelText(/Email Address/), 'asha@example.com');
    await user.selectOptions(f.getByLabelText(/I am a/), contact.form.fields.profile.options[0]);
    await user.type(f.getByLabelText(/Message/), 'We need boutique staff.');
  };

  it('shows errors and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App />);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(within(form()).getAllByText(contact.form.errors.required).length).toBeGreaterThan(0);
    expect(within(form()).getByLabelText(/First Name/)).toHaveFocus();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts valid enquiries to the configured endpoint', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    render(<App />);
    await fillValid(user);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(fetchSpy).toHaveBeenCalledWith(
      contact.form.endpoint,
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).toMatchObject({ 'Full Name': 'Asha Mehta', _replyto: 'asha@example.com' });
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.success);
  });

  it('shows the failure message when the endpoint reports success "false"', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"success":"false","message":"This form needs Activation."}', { status: 200 }),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    await fillValid(user);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    const alert = await within(form()).findByRole('alert');
    expect(alert).toHaveTextContent(contact.form.failureTitle);
    expect(alert).toHaveTextContent(contact.form.failures.server);
    expect(within(form()).getByLabelText(/First Name/)).toHaveValue('Asha');
  });

  it('explains a network failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    await fillValid(user);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(await within(form()).findByRole('alert')).toHaveTextContent(contact.form.failures.network);
  });

  it('explains a timeout', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    await fillValid(user);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(await within(form()).findByRole('alert')).toHaveTextContent(contact.form.failures.timeout);
  });

  it.each([
    ['First Name', '1', contact.form.errors.nameShort],
    ['First Name', 'A1', contact.form.errors.nameInvalid],
    ['Phone', '12345', contact.form.errors.phoneInvalid],
    ['Phone', 'call me', contact.form.errors.phoneInvalid],
    ['Message', 'Hi', contact.form.errors.messageShort],
  ])('rejects %s "%s"', async (label, value, message) => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App />);
    await fillValid(user);
    const field = within(form()).getByLabelText(new RegExp(label));
    await user.clear(field);
    await user.type(field, value);
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(within(form()).getByText(message)).toBeInTheDocument();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveFocus();
    expect(within(form()).getByText(contact.form.invalidSummary(1))).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('accepts a formatted Indian phone number', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"success":"true"}', { status: 200 }));
    render(<App />);
    await fillValid(user);
    await user.type(within(form()).getByLabelText(/Phone/), '+91 98765-43210');
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.successTitle);
  });

  it('validates a field when the visitor leaves it and clears the error once fixed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const email = within(form()).getByLabelText(/Email Address/);
    await user.type(email, 'asha@');
    await user.tab();
    expect(within(form()).getByText(contact.form.errors.emailInvalid)).toBeInTheDocument();
    await user.type(email, 'example.com');
    expect(email).toHaveAttribute('aria-invalid', 'false');
    await waitFor(() =>
      expect(within(form()).queryByText(contact.form.errors.emailInvalid)).not.toBeInTheDocument(),
    );
  });

  it('sends only one request when submitted twice in quick succession', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<App />);
    await fillValid(user);
    fireEvent.submit(form());
    fireEvent.submit(form());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps the form within narrow screens', () => {
    render(<App />);
    expect(form().closest('.grid')).toHaveClass('grid-cols-1');
  });

  it('silently drops submissions that fill the honeypot', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { container } = render(<App />);
    await fillValid(user);
    container.querySelector('input[name="company_website"]').value = 'spam';
    await user.click(within(form()).getByRole('button', { name: contact.form.submit }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('contact form with Google Sheets enabled', () => {
  const SHEETS = 'https://script.google.com/macros/s/test/exec';
  const form = () => screen.getByRole('form', { name: 'Contact form' });
  const ok = (body) => () => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

  beforeEach(() => {
    contact.form.sheetsEndpoint = SHEETS;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    contact.form.sheetsEndpoint = null;
  });

  const mockChannels = ({ formsubmit, sheets }) =>
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => (url === SHEETS ? sheets() : formsubmit()));

  const submitValid = async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const f = within(form());
    await user.type(f.getByLabelText(/First Name/), 'Asha');
    await user.type(f.getByLabelText(/Last Name/), 'Mehta');
    await user.type(f.getByLabelText(/Email Address/), 'asha@example.com');
    await user.selectOptions(f.getByLabelText(/I am a/), 'Other');
    await user.type(f.getByLabelText(/Message/), 'Need staff.');
    await user.click(f.getByRole('button', { name: contact.form.submit }));
  };

  it('sends every enquiry to both FormSubmit and the Sheet', async () => {
    const fetchSpy = mockChannels({ formsubmit: ok({ success: 'true' }), sheets: ok({ ok: true }) });
    await submitValid();
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.success);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const [, sheetsInit] = fetchSpy.mock.calls.find(([url]) => url === SHEETS);
    expect(sheetsInit.headers['Content-Type']).toBe('text/plain;charset=utf-8');
    expect(JSON.parse(sheetsInit.body)).toMatchObject({
      name: 'Asha Mehta',
      email: 'asha@example.com',
      phone: 'Not provided',
      profile: 'Other',
      message: 'Need staff.',
      company_website: '',
    });
  });

  it('still confirms when only the Sheet saves it', async () => {
    mockChannels({ formsubmit: () => Promise.reject(new TypeError('Failed to fetch')), sheets: ok({ ok: true }) });
    await submitValid();
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.success);
  });

  it('still confirms when only FormSubmit sends it', async () => {
    mockChannels({ formsubmit: ok({ success: 'true' }), sheets: ok({ ok: false, error: 'save-failed' }) });
    await submitValid();
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.success);
  });

  it('shows the failure message when both channels fail', async () => {
    mockChannels({
      formsubmit: ok({ success: 'false', message: 'This form needs Activation.' }),
      sheets: ok({ ok: false, error: 'rate-limited' }),
    });
    await submitValid();
    expect(await within(form()).findByRole('alert')).toHaveTextContent(contact.form.failures.server);
    expect(within(form()).queryByRole('status')).not.toBeInTheDocument();
  });

  it('treats a non-JSON Sheet reply as a failure', async () => {
    mockChannels({
      formsubmit: () => Promise.reject(new TypeError('Failed to fetch')),
      sheets: () => Promise.resolve(new Response('<html>Sign in</html>', { status: 200 })),
    });
    await submitValid();
    expect(await within(form()).findByRole('alert')).toHaveTextContent(contact.form.failures.network);
  });
});

describe('contact form on Netlify', () => {
  const form = () => screen.getByRole('form', { name: 'Contact form' });
  const netlifyCall = ([url]) => url === '/';

  beforeEach(() => {
    contact.form.netlifyForm = 'enquiry';
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    contact.form.netlifyForm = null;
  });

  const submitValid = async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const f = within(form());
    await user.type(f.getByLabelText(/First Name/), 'Asha');
    await user.type(f.getByLabelText(/Last Name/), 'Mehta');
    await user.type(f.getByLabelText(/Email Address/), 'asha@example.com');
    await user.selectOptions(f.getByLabelText(/I am a/), 'Other');
    await user.type(f.getByLabelText(/Message/), 'Need boutique staff.');
    await user.click(f.getByRole('button', { name: contact.form.submit }));
  };

  it('posts to Netlify Forms and skips the backup when Netlify accepts it', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    await submitValid();
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.successTitle);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(Object.fromEntries(new URLSearchParams(init.body))).toMatchObject({
      'form-name': 'enquiry',
      subject: 'New website enquiry (Other) — Asha Mehta',
      name: 'Asha Mehta',
      email: 'asha@example.com',
    });
    const letter = Object.fromEntries(new URLSearchParams(init.body)).Enquiry;
    expect(letter).toContain('PROSTAFF SOLUTION');
    expect(letter).toContain('Asha Mehta');
    expect(letter).toContain('asha@example.com');
    expect(letter).toContain('Need boutique staff.');
    expect(letter).toContain('Other');
  });

  it('falls back to FormSubmit when Netlify rejects the submission', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation((...args) =>
        Promise.resolve(
          netlifyCall(args)
            ? new Response('Not found', { status: 404 })
            : new Response('{"success":"true"}', { status: 200 }),
        ),
      );
    await submitValid();
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.successTitle);
    expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual(['/', contact.form.endpoint]);
  });

  it('reports a failure only when Netlify and the backup both fail', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((...args) =>
      Promise.resolve(
        netlifyCall(args)
          ? new Response('Server error', { status: 500 })
          : new Response('{"success":"false"}', { status: 200 }),
      ),
    );
    await submitValid();
    expect(await within(form()).findByRole('alert')).toHaveTextContent(contact.form.failures.server);
  });
});

describe('footer', () => {
  it('links the legal pages, LinkedIn and phone', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    const f = within(footer);
    expect(f.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      expect.stringContaining('privacy.html'),
    );
    expect(f.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      expect.stringContaining('terms.html'),
    );
    expect(f.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      company.social.linkedin,
    );
    expect(f.getByRole('link', { name: company.phone })).toHaveAttribute(
      'href',
      'tel:+919023558486',
    );
  });
});
