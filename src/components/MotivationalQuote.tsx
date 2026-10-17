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
  const text = language === 'vi' ? quote.textVi : quote.textEn;
  const author = language === 'vi' ? quote.authorVi : quote.authorEn;

  return (
    <div className="motivational-quote-card" key={quote.id}>
      <p className="quote-text">
        <span className="quote-accent-mark" style={{ color: accentColor }}>“</span>
        {text}
        <span className="quote-accent-mark" style={{ color: accentColor }}>”</span>
      </p>
      {author && <div className="quote-author">— {author}</div>}
    </div>
  );
};
