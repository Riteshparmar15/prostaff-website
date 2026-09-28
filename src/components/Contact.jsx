import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { contact } from '../data/content';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import Reveal, { EASE_LUXE, stagger } from './ui/Reveal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = ['firstName', 'lastName', 'email', 'profile', 'message'];
const INITIAL = { firstName: '', lastName: '', email: '', phone: '', profile: '', message: '' };
const SUCCESS_TIMEOUT = 5000;
const HONEYPOT = 'company_website';

function validate(values) {
  const { errors } = contact.form;
  const out = {};
  REQUIRED.forEach((key) => {
    if (!values[key].trim()) out[key] = errors.required;
  });
  if (!out.email && !EMAIL_RE.test(values.email.trim())) out.email = errors.emailInvalid;
  return out;
}

/* ------------------------------------------------------------------ */

function Field({ name, error, required, children }) {
  const { label } = contact.form.fields[name];
  const id = `contact-${name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-micro font-semibold uppercase tracking-btn text-gold-deep"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs font-normal text-red-800"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const f = contact.form;
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const succeed = () => {
    setStatus('success');
    setValues(INITIAL);
    setTimeout(() => setStatus('idle'), SUCCESS_TIMEOUT);
  };

  const inputProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    placeholder: f.fields[name].placeholder,
    onChange: (e) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
    },
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
    'aria-required': REQUIRED.includes(name) || undefined,
    className: 'field',
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = REQUIRED.find((k) => found[k]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    // Honeypot: real visitors never see or fill this field
    if (e.currentTarget.elements.namedItem(HONEYPOT)?.value) {
      succeed();
      return;
    }

    setStatus('sending');
    try {
      // Accept header makes Formspree / Getform / Web3Forms reply with JSON instead of redirecting
      const res = await fetch(f.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...values,
          name: `${values.firstName} ${values.lastName}`.trim(),
          _subject: `New enquiry (${values.profile}) — ${values.firstName} ${values.lastName}`,
          _replyto: values.email,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      succeed();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Contact form"
      className="relative space-y-5 rounded-luxe border border-sand bg-white/70 p-7 shadow-card md:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" error={errors.firstName} required>
          <input type="text" autoComplete="given-name" {...inputProps('firstName')} />
        </Field>
        <Field name="lastName" error={errors.lastName} required>
          <input type="text" autoComplete="family-name" {...inputProps('lastName')} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="email" error={errors.email} required>
          <input type="email" autoComplete="email" {...inputProps('email')} />
        </Field>
        <Field name="phone">
          <input type="tel" inputMode="tel" autoComplete="tel" {...inputProps('phone')} />
        </Field>
      </div>

      <Field name="profile" error={errors.profile} required>
        <div className="relative">
          <select
            {...inputProps('profile')}
            className={`field appearance-none pr-10 ${values.profile ? '' : 'text-stone/60'}`}
          >
            <option value="" disabled>
              {f.fields.profile.placeholder}
            </option>
            {f.fields.profile.options.map((opt) => (
              <option key={opt} value={opt} className="text-ink">
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.5}
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
          />
        </div>
      </Field>

      <Field name="message" error={errors.message} required>
        <textarea rows={5} {...inputProps('message')} className="field resize-y" />
      </Field>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT}>Leave this field empty</label>
        <input
          id={HONEYPOT}
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          variant="gold"
          arrow={status !== 'sending'}
          disabled={status === 'sending'}
          aria-busy={status === 'sending'}
        >
          {status === 'sending' ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 animate-spin" />
              {f.sending}
            </span>
          ) : (
            f.submit
          )}
        </Button>
        <p className="text-xs text-stone">
          {f.consent.before}
          <a
            href={f.consent.href}
            className="text-gold-deep underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
          >
            {f.consent.link}
          </a>
          {f.consent.after}
        </p>
      </div>

      <AnimatePresence>
        {status === 'success' && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
            className="rounded-luxe border border-gold/50 bg-gold/10 px-5 py-4 text-sm font-normal tracking-wide text-gold-deep"
          >
            ✦ &nbsp; {f.success}
          </motion.p>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-800">
          {f.failure}
        </p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="surface-glow section-pad bg-ivory"
    >
      <div className="container-luxe">
        <SectionHeading id="contact-title" eyebrow={contact.eyebrow} title={contact.title} />

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
          <div>
            <Reveal
              as="p"
              className="font-serif text-2xl italic leading-relaxed text-ink md:text-[1.75rem]"
            >
              {contact.tagline}
            </Reveal>

            <ul className="mt-12 space-y-6">
              {contact.details.map(({ icon: Icon, label, value, href, external }, i) => (
                <Reveal
                  as="li"
                  key={label}
                  delay={stagger(i + 1)}
                  className="group flex items-start gap-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-luxe border border-gold/40 bg-gold/5 text-gold transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/10">
                    <Icon aria-hidden="true" strokeWidth={1.25} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-micro font-semibold uppercase tracking-btn text-gold-deep">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                        className="mt-1 block text-body text-ink transition-colors hover:text-gold-deep"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="mt-1 block text-body text-ink">{value}</span>
                    )}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={stagger(1)}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
