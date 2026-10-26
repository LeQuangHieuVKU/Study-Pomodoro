import React from 'react';
import type { QuoteItem, AppLanguage } from '../types';

interface MotivationalQuoteProps {
  quote: QuoteItem;
  language: AppLanguage;
  accentColor?: string;
  t?: (key: any) => string;
}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  quote,
  language,
  accentColor = '#6366F1',
}) => {
  const rawText = language === 'vi' ? quote.textVi : quote.textEn;
  const rawAuthor = language === 'vi' ? quote.authorVi : quote.authorEn;

  // Unicode NFC normalization guarantees pre-composed Vietnamese glyphs with no split diacritics
  const text = (rawText || '').normalize('NFC');
  const author = (rawAuthor || '').normalize('NFC');

  return (
    <div className="motivational-quote-card" key={quote.id}>
      <p className="quote-text" lang={language}>
        <span className="quote-accent-mark" style={{ color: accentColor }} aria-hidden="true">
          “
        </span>
        {text}
        <span className="quote-accent-mark" style={{ color: accentColor }} aria-hidden="true">
          ”
        </span>
      </p>
      {author && <div className="quote-author">— {author}</div>}
    </div>
  );
};
