import { getMarkdown, getNotFoundMarkdown, getNotFoundHtml, VALID_ROUTES } from './markdownContent.js';

export default function handler(req, res) {
  const queryPath = typeof req.query?.path === 'string' ? req.query.path : '';
  const urlPath = req.url ? req.url.split('?')[0] : '/';
  const rawPath = queryPath || urlPath || '/';
  const normalized = '/' + String(rawPath).replace(/^\/+/, '').replace(/\/+$/, '');
  const targetRoute = normalized === '' ? '/' : normalized;

  const acceptHeader = req.headers['accept'] || req.headers['Accept'] || '';
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(', ') : String(acceptHeader);
  const wantsMarkdown = accept.toLowerCase().includes('text/markdown');

  // Always advertise Vary: Accept for proper CDN caching & Ora audit compliance
  res.setHeader('Vary', 'Accept');

  const isValid = VALID_ROUTES.has(targetRoute);

  // 1. Markdown Content Negotiation
  if (wantsMarkdown) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    if (isValid) {
      const content = getMarkdown(targetRoute);
      return res.status(200).send(content);
    } else {
      const notFoundContent = getNotFoundMarkdown(rawPath);
      return res.status(404).send(notFoundContent);
    }
  }

  // 2. HTML/Unknown routes (404 Not Found)
  if (!isValid) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html404 = getNotFoundHtml(rawPath);
    return res.status(404).send(html404);
  }

  // 3. Fallback for valid route requested directly
  const fallbackMd = getMarkdown(targetRoute);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  return res.status(200).send(fallbackMd);
}
