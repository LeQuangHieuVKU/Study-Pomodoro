import React from 'react';
import type { QuoteItem, AppLanguage } from '../types';
import { Sparkles, Quote } from 'lucide-react';

interface MotivationalQuoteProps {
  quote: QuoteItem;
  language: AppLanguage;
  t: (key: any) => string;
}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  quote,
  language,
  t,
}) => {
  const text = language === 'vi' ? quote.textVi : quote.textEn;
  const author = language === 'vi' ? quote.authorVi : quote.authorEn;

  return (
    <div className="motivational-quote-card" key={quote.id}>
      <div className="quote-header">
        <Sparkles size={16} className="quote-sparkle-icon" />
        <span className="quote-label">{t('quoteTitle')}</span>
      </div>

      <div className="quote-body">
        <Quote size={20} className="quote-mark-icon" />
        <p className="quote-text">{text}</p>
      </div>

      {author && <div className="quote-author">— {author}</div>}
    </div>
  );
};
