/**
 * All Prostaff Solution site copy lives here. Components are purely
 * presentational and read from these objects.
 *
 * Rich text uses segment arrays: { text } for plain, { text, strong: true }
 * for gold-highlighted words, { text, em: true } for gold italic words and
 * { br: true } for a line break.
 */
import {
  BriefcaseBusiness,
  Car,
  Clock,
  Crosshair,
  Gem,
  Globe,
  Handshake,
  Hotel,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shirt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  UserRoundSearch,
  ConciergeBell,
} from 'lucide-react';

export const brand = {
  name: 'Prostaff Solution',
  legalName: 'Prostaff Solution Private Limited',
  wordmark: 'Prostaff',
  wordmarkSub: 'Solution',
  monogram: 'PS',
};

/*
 * Company facts. Every `null` field is hidden on the site; fill it in and it
 * appears automatically (contact details, footer, structured data).
 */
export const company = {
  email: 'info@prostaffsolution.com',
  foundedYear: null, // e.g. 2022
  address: 'Mumbai, Maharashtra, India',
  phone: '+91 22 4890 2140',
  whatsapp: '912248902140', // digits only with country code
  hours: 'Monday – Saturday, 9am – 6pm IST',
  cin: null, // Corporate Identification Number
  gst: null,
  social: {
    linkedin: 'https://www.linkedin.com/company/prostafff-solution',
    instagram: null, // full URL
  },
};

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */
export const nav = {
  links: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'industries', label: 'Industries' },
    { id: 'contact', label: 'Contact' },
  ],
  cta: { label: 'Get in Touch', href: '#contact' },
};

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
export const hero = {
  eyebrow: 'Premium Staffing Solutions',
  // Each inner array is one visual line of the H1.
  headingLines: [
    [{ text: 'Connecting ' }, { text: 'Exceptional', em: true }],
    [{ text: 'Talent with' }],
    [{ text: 'Luxury Brands' }],
  ],
  subheading:
    "Prostaff Solution specialises in curating elite professionals for the world's most prestigious organisations, redefining what it means to recruit with purpose.",
  primaryCta: { label: 'Explore Services', href: '#services' },
  secondaryCta: { label: 'Partner With Us', href: '#contact' },
  scrollCue: { label: 'Discover', href: '#about' },
  // Ambient background only; the sectors themselves live in the Industries section.
  slides: [
    { base: '/images/hero/tailored' },
    { base: '/images/hero/interview' },
    { base: '/images/hero/partnership' },
    { base: '/images/hero/executive' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */
export const stats = [
  { value: 500, suffix: '+', label: 'Candidates Placed' },
  { value: 3, suffix: '+', label: 'Years in Luxury Staffing' },
  { value: 50, suffix: '+', label: 'Luxury Brands Served' },
  { value: 100, suffix: '%', label: 'Client Retention Rate' },
];

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */
export const about = {
  eyebrow: 'Our Story',
  title: [
    { text: 'Built on Trust,' },
    { br: true },
    { text: 'Driven by ' },
    { text: 'Excellence', em: true },
  ],
  paragraphs: [
    [
      {
        text: 'Prostaff Solution Private Limited was founded with a singular vision: to bridge the gap between ',
      },
      { text: 'extraordinary talent', strong: true },
      {
        text: ' and the brands that demand nothing less than exceptional. We understand that in the luxury sector, every hire is a statement.',
      },
    ],
    [
      {
        text: "Our consultants bring deep industry knowledge and an unmatched network across hospitality, fashion, lifestyle, and premium retail. We don't just fill positions — we ",
      },
      { text: 'craft careers', strong: true },
      { text: ' and ' },
      { text: 'build teams', strong: true },
      { text: ' that last.' },
    ],
  ],
  values: [
    {
      icon: Crosshair,
      title: 'Precision Matching',
      description:
        'We go beyond CVs — understanding culture fit, ambition, and potential to ensure placements that stand the test of time.',
    },
    {
      icon: ShieldCheck,
      title: 'Confidential & Discreet',
      description:
        "Handling every search with the utmost discretion, protecting both our clients' reputation and our candidates' privacy.",
    },
    {
      icon: Handshake,
      title: 'Long-Term Partnerships',
      description:
        'We invest in relationships, not transactions, and stay close to every placement well beyond the first day.',
    },
  ],
  image: {
    src: '/images/about.webp',
    alt: 'Two professionals shaking hands across a meeting table',
  },
  quote: {
    text: 'We don’t simply place professionals — we architect the foundations of exceptional organisations.',
    cite: 'Prostaff Solution',
  },
};

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */
export const services = {
  eyebrow: 'What We Offer',
  title: [
    { text: 'Tailored Staffing' },
    { br: true },
    { text: 'for a ' },
    { text: 'Discerning', em: true },
    { text: ' World' },
  ],
  cta: { label: 'Discuss a Requirement', href: '#contact' },
  items: [
    {
      icon: UserRoundSearch,
      title: 'Executive Search',
      description:
        'Identifying and attracting C-suite and senior leadership talent who drive transformation and growth within luxury organisations.',
      points: [
        'Director & VP level placements',
        'Confidential search mandates',
        'Succession planning support',
      ],
    },
    {
      icon: Sparkles,
      title: 'Luxury Retail Staffing',
      description:
        'Connecting premium retail brands with client-facing professionals who embody brand values and deliver five-star experiences.',
      points: [
        'Brand ambassadors & stylists',
        'Store manager placements',
        'Customer experience specialists',
      ],
    },
    {
      icon: ConciergeBell,
      title: 'Hospitality Placement',
      description:
        'Staffing luxury hotels, resorts, and fine dining establishments with professionals who understand the art of refined service.',
      points: ['Hotel management talent', 'F&B specialists', 'Guest experience professionals'],
    },
    {
      icon: Target,
      title: 'Contract & Interim',
      description:
        'Agile staffing solutions for seasonal peaks, project launches, and short-term requirements without compromising on calibre.',
      points: ['Event & launch staffing', 'Seasonal workforce', 'Project-based hiring'],
    },
    {
      icon: Globe,
      title: 'Talent Consulting',
      description:
        'Strategic HR advisory helping luxury brands build compelling employer brands and talent pipelines for long-term success.',
      points: ['Employer branding strategy', 'Compensation benchmarking', 'Workforce planning'],
    },
    {
      icon: BriefcaseBusiness,
      title: 'Career Partnerships',
      description:
        'Dedicated support for ambitious professionals seeking to transition into or advance within the luxury and premium lifestyle sector.',
      points: ['Career path consultation', 'CV & interview coaching', 'Exclusive job access'],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Industries                                                         */
/* ------------------------------------------------------------------ */
export const industries = {
  title: 'Industries We Serve',
  subtitle: 'Specialising across the full luxury lifestyle spectrum',
  items: [
    {
      icon: Shirt,
      name: 'Fashion',
      roles: ['Boutique Directors', 'Personal Stylists', 'Visual Merchandisers'],
      image: {
        webp: '/images/industries/fashion.webp',
        webpMobile: '/images/industries/fashion-mobile.webp',
        alt: 'Minimal rail of cream and camel knitwear in a designer atelier',
      },
    },
    {
      icon: Gem,
      name: 'Jewellery',
      roles: ['Client Advisors', 'Boutique Managers', 'Clienteling Specialists'],
      image: {
        webp: '/images/industries/jewellery.webp',
        webpMobile: '/images/industries/jewellery-mobile.webp',
        alt: 'Gold chain bracelet resting on an open fashion magazine',
      },
    },
    {
      icon: Hotel,
      name: 'Hospitality',
      roles: ['Front Office Managers', 'Concierge Teams', 'Fine-Dining Service Staff'],
      image: {
        webp: '/images/industries/hospitality.webp',
        webpMobile: '/images/industries/hospitality-mobile.webp',
        alt: 'Luxury resort and pool lit at dusk',
      },
    },
    {
      icon: ShoppingBag,
      name: 'Premium Retail',
      roles: ['Area & Cluster Managers', 'Beauty Advisors', 'Store Associates'],
      image: {
        webp: '/images/industries/retail.webp',
        webpMobile: '/images/industries/retail-mobile.webp',
        alt: 'Softly lit premium boutique with curated shelving',
      },
    },
    {
      icon: Car,
      name: 'Automotive',
      roles: ['Sales Consultants', 'Client Relationship Managers', 'Showroom Hosts'],
      image: {
        webp: '/images/industries/automotive.webp',
        webpMobile: '/images/industries/automotive-mobile.webp',
        alt: 'Grey luxury coupe photographed at dusk',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */
export const contact = {
  eyebrow: 'Get in Touch',
  title: [
    { text: "Let's Build Something" },
    { br: true },
    { text: 'Remarkable', em: true },
    { text: ' Together' },
  ],
  tagline:
    '“Whether you’re a brand seeking top talent or a professional ready for your next chapter — we’re here.”',
  details: [
    { icon: MapPin, label: 'Office', value: company.address ?? 'India' },
    { icon: Mail, label: 'Email', value: company.email, href: `mailto:${company.email}` },
    company.phone && {
      icon: Phone,
      label: 'Phone',
      value: company.phone,
      href: `tel:${company.phone.replace(/[^\d+]/g, '')}`,
    },
    company.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat with us',
      href: `https://wa.me/${company.whatsapp}`,
      external: true,
    },
    { icon: Clock, label: 'Office Hours', value: company.hours },
  ].filter(Boolean),
  form: {
    fields: {
      firstName: { label: 'First Name', placeholder: 'Your first name' },
      lastName: { label: 'Last Name', placeholder: 'Your last name' },
      email: { label: 'Email Address', placeholder: 'your@email.com' },
      phone: { label: 'Phone (optional)', placeholder: '+91 98765 43210' },
      profile: {
        label: 'I am a',
        placeholder: 'Select your profile',
        options: ['Employer / Brand', 'Job Seeker / Candidate', 'Partnership Enquiry', 'Other'],
      },
      message: { label: 'Message', placeholder: 'Tell us about your requirements...' },
    },
    submit: 'Send Message',
    sending: 'Sending…',
    success: "Thank you. We'll be in touch within 24 hours.",
    failure: 'Something went wrong. Please try again or email info@prostaffsolution.com.',
    consent: {
      before: 'By submitting, you agree to our ',
      link: 'Privacy Policy',
      href: '/privacy.html',
      after: '.',
    },
    errors: {
      required: 'This field is required.',
      emailInvalid: 'Please enter a valid email address.',
    },
    // Set VITE_CONTACT_ENDPOINT in .env (see .env.example). Falls back to the dev mock.
    endpoint: import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact',
  },
};

/* ------------------------------------------------------------------ */
/*  Testimonials — the section stays hidden when `items` is empty      */
/* ------------------------------------------------------------------ */
export const testimonials = {
  eyebrow: 'Testimonials',
  title: [{ text: 'In Their ' }, { text: 'Words', em: true }],
  items: [
    {
      quote:
        'I applied once, got a clear reply, and landed interviews that actually matched my store experience.',
      role: 'Store Associate',
      org: 'Placed · Lifestyle retail · India',
    },
    {
      quote:
        'They explained the UAE process upfront — no false promises, just a serious shortlist for the right floor.',
      role: 'Beauty Advisor',
      org: 'Placed · Premium retail · UAE',
    },
    {
      quote:
        'As a store manager looking to step up, the brief and interview loop felt professional and respectful of my time.',
      role: 'Store Manager',
      org: 'Placed · Apparel · West India',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
export const footer = {
  tagline:
    'Premium staffing for fashion, jewellery, hospitality, premium retail and automotive brands.',
  columns: [
    {
      title: 'Navigate',
      nav: true,
      links: [
        { label: 'Home', href: '#home' },
        { label: 'About Us', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Industries', href: '#industries' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: company.email, href: `mailto:${company.email}` },
        company.phone && {
          label: company.phone,
          href: `tel:${company.phone.replace(/[^\d+]/g, '')}`,
        },
        company.address && { label: company.address },
      ].filter(Boolean),
    },
  ],
  copyright: `© ${new Date().getFullYear()} Prostaff Solution Private Limited. All rights reserved.`,
  registration: [
    'Pvt. Ltd. Registered in India',
    company.cin && `CIN ${company.cin}`,
    company.gst && `GSTIN ${company.gst}`,
  ]
    .filter(Boolean)
    .join(' · '),
  legal: [
    { label: 'Privacy Policy', href: '/privacy.html' },
    { label: 'Terms of Use', href: '/terms.html' },
  ],
  social: [
    company.social.linkedin && {
      label: 'LinkedIn',
      href: company.social.linkedin,
      icon: 'linkedin',
    },
    company.social.instagram && {
      label: 'Instagram',
      href: company.social.instagram,
      icon: 'instagram',
    },
  ].filter(Boolean),
};
