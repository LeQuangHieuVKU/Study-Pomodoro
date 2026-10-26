import { getMarkdown, getNotFoundMarkdown, getNotFoundHtml, VALID_ROUTES } from './api/markdownContent.js';

// Paths that should always be passed through to static files
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|css|js|json|xml|txt|webmanifest|mp3|wav|ogg|woff|woff2|ttf|map)$/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Pass through static assets, public files, and API endpoints
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/audio/') ||
    pathname.startsWith('/backgrounds/') ||
    pathname.startsWith('/api/') ||
    STATIC_EXTENSIONS.test(pathname)
  ) {
    return; // Pass through to static file serving
  }

  const accept = request.headers.get('accept') || '';
  const wantsMarkdown = accept.toLowerCase().includes('text/markdown');
  const normalized = '/' + pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const targetRoute = normalized === '' ? '/' : normalized;
  const isValid = VALID_ROUTES.has(targetRoute);

  // 2. Client explicitly requests Markdown (Ora check 3)
  if (wantsMarkdown) {
    if (isValid) {
      const md = getMarkdown(targetRoute);
      return new Response(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    } else {
      // Agent-friendly 404 with markdown body (Ora check 1)
      const md404 = getNotFoundMarkdown(pathname);
      return new Response(md404, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  // 3. Client does NOT request Markdown, but the route is nonexistent -> return real 404 HTML
  if (!isValid) {
    const html404 = getNotFoundHtml(pathname);
    return new Response(html404, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Vary': 'Accept',
        'Cache-Control': 'no-store',
      },
    });
  }

  // 4. Valid route for HTML/standard request -> allow Vercel to serve index.html
  return;
}

export { middleware };
