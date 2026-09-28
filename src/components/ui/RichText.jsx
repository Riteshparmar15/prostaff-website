import { Fragment } from 'react';

/**
 * Renders a segment array from content.js:
 *   { text } · { text, strong } · { text, em } · { br }
 * `tone` controls the highlight colour for light vs dark backgrounds.
 */
export default function RichText({ segments, tone = 'light' }) {
  const accent = tone === 'dark' ? 'text-gold-light' : 'text-gold-deep';

  return segments.map((seg, i) => {
    if (seg.br) return <br key={i} />;
    if (seg.em)
      return (
        <em
          key={i}
          className={`font-normal italic ${tone === 'dark' ? 'text-gold-light' : 'text-gold'}`}
        >
          {seg.text}
        </em>
      );
    if (seg.strong)
      return (
        <strong key={i} className={`font-medium ${accent}`}>
          {seg.text}
        </strong>
      );
    return <Fragment key={i}>{seg.text}</Fragment>;
  });
}
