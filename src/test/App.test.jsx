import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
    expect(body).toMatchObject({ name: 'Asha Mehta', _replyto: 'asha@example.com' });
    expect(await within(form()).findByRole('status')).toHaveTextContent(contact.form.success);
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
