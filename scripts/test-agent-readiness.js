import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMarkdown, getNotFoundMarkdown, getNotFoundHtml, VALID_ROUTES } from '../api/markdownContent.js';
import middleware from '../middleware.js';
import handler from '../api/handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- Testing Ora Agent Readiness Checks Locally ---');

// 1. Raw HTML content without JS (Ora check 2)
const indexHtmlPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Extract content inside <div id="root">...</div>
const rootMatch = indexHtml.match(/<div id="root">([\s\S]*?)<\/div>/i);
assert(rootMatch && rootMatch[1], 'index.html contains non-empty #root placeholder content');

// Strip HTML tags to measure raw visible text length
const rawText = rootMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log(`Raw text content length inside #root: ${rawText.length} characters`);
assert(rawText.length >= 500, `Raw text content inside #root must be >= 500 chars (found ${rawText.length})`);
assert(/<h1[\s>]/i.test(indexHtml) && indexHtml.includes('</h1>'), 'index.html contains an H1 heading');
assert(/<h2[\s>]/i.test(indexHtml) && indexHtml.includes('</h2>'), 'index.html contains H2 headings');

// 2. Organization Schema completeness (Ora check 6)
assert(indexHtml.includes('"@type": "Organization"'), 'Schema includes Organization type');
assert(indexHtml.includes('"contactPoint":'), 'Organization schema includes contactPoint');
assert(indexHtml.includes('"address":'), 'Organization schema includes PostalAddress');

// 3. Agent instruction / when-to-use in llms.txt (Ora check 5)
const llmsPath = path.join(rootDir, 'public', 'llms.txt');
assert(fs.existsSync(llmsPath), 'public/llms.txt exists');
const llmsContent = fs.readFileSync(llmsPath, 'utf8');
assert(llmsContent.toLowerCase().includes('when to use this'), 'llms.txt includes "When to use this" section');
assert(llmsContent.length >= 500, `llms.txt has substantial content (${llmsContent.length} chars)`);

// 4. Trust anchor pages (Ora check 7)
const contactPagePath = path.join(rootDir, 'src', 'pages', 'ContactPage.tsx');
const privacyPagePath = path.join(rootDir, 'src', 'pages', 'PrivacyPage.tsx');
assert(fs.existsSync(contactPagePath), 'src/pages/ContactPage.tsx exists');
assert(fs.existsSync(privacyPagePath), 'src/pages/PrivacyPage.tsx exists');

const contactContent = fs.readFileSync(contactPagePath, 'utf8');
const privacyContent = fs.readFileSync(privacyPagePath, 'utf8');
assert(contactContent.length >= 1000, `ContactPage.tsx is rich (> 1000 chars, found ${contactContent.length})`);
assert(privacyContent.length >= 1000, `PrivacyPage.tsx is rich (> 1000 chars, found ${privacyContent.length})`);

// 5. Sitemap contains all trust pages
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.includes('https://studypomodoro.id.vn/'), 'sitemap.xml includes root /');
assert(sitemapContent.includes('/about'), 'sitemap.xml includes /about');
assert(sitemapContent.includes('/contact'), 'sitemap.xml includes /contact');
assert(sitemapContent.includes('/privacy'), 'sitemap.xml includes /privacy');

// 6. Markdown content negotiation helper tests (Ora check 3 & check 1)
assert(VALID_ROUTES.has('/'), 'VALID_ROUTES has /');
assert(VALID_ROUTES.has('/about'), 'VALID_ROUTES has /about');
assert(VALID_ROUTES.has('/contact'), 'VALID_ROUTES has /contact');
assert(VALID_ROUTES.has('/privacy'), 'VALID_ROUTES has /privacy');

const homeMd = getMarkdown('/');
assert(homeMd && homeMd.length > 200, 'getMarkdown("/") returns rich markdown');

const aboutMd = getMarkdown('/about');
assert(aboutMd && aboutMd.length > 200, 'getMarkdown("/about") returns rich markdown');

const notFoundMd = getNotFoundMarkdown('/some-nonexistent-path');
assert(notFoundMd && notFoundMd.length >= 20, '404 markdown body is >= 20 chars');
assert(notFoundMd.includes('llms.txt') || notFoundMd.includes('sitemap.xml'), '404 markdown points agents to llms.txt or sitemap');

// 7. Middleware edge tests
console.log('--- Testing Edge Middleware ---');

// Case A: Accept text/markdown on /
const reqA = new Request('https://studypomodoro.id.vn/', {
  headers: { 'accept': 'text/markdown, text/html' }
});
const resA = middleware(reqA);
assert(resA instanceof Response, 'Middleware handles text/markdown on /');
assert(resA.status === 200, 'Status is 200');
assert(resA.headers.get('Content-Type').includes('text/markdown'), 'Content-Type is text/markdown');
assert(resA.headers.get('Vary') === 'Accept', 'Vary header is Accept');

// Case B: Accept text/markdown on /some-path-that-does-not-exist (Ora check 1)
const reqB = new Request('https://studypomodoro.id.vn/some-path-that-does-not-exist', {
  headers: { 'accept': 'text/markdown' }
});
const resB = middleware(reqB);
assert(resB instanceof Response, 'Middleware handles nonexistent path');
assert(resB.status === 404, 'Status is real 404 (not 200 soft-404)');
assert(resB.headers.get('Content-Type').includes('text/markdown'), '404 Content-Type is text/markdown');
assert(resB.headers.get('Vary') === 'Accept', '404 Vary header is Accept');

// Case C: Standard browser request on unknown route
const reqC = new Request('https://studypomodoro.id.vn/unknown-route', {
  headers: { 'accept': 'text/html' }
});
const resC = middleware(reqC);
assert(resC instanceof Response, 'Middleware handles text/html on unknown route');
assert(resC.status === 404, 'Status is real 404');
assert(resC.headers.get('Content-Type').includes('text/html'), 'Content-Type is text/html');

// Case D: Static assets pass through
const reqD = new Request('https://studypomodoro.id.vn/assets/index.js');
const resD = middleware(reqD);
assert(resD === undefined, 'Static asset passes through middleware without interruption');

// Case E: Standard browser request on valid route (let static index.html serve)
const reqE = new Request('https://studypomodoro.id.vn/', {
  headers: { 'accept': 'text/html' }
});
const resE = middleware(reqE);
assert(resE === undefined, 'Valid HTML route passes through to Vercel static serving');

// 8. Serverless Function Handler tests (Defense-in-depth)
console.log('--- Testing Serverless Function Handler ---');

let handledStatus = 0;
let handledHeaders = {};
let handledBody = '';

const mockRes = {
  setHeader(key, val) { handledHeaders[key] = val; return this; },
  status(code) { handledStatus = code; return this; },
  send(body) { handledBody = body; return this; }
};

// Test markdown negotiation on handler
handler({ headers: { accept: 'text/markdown' }, query: { path: '/' } }, mockRes);
assert(handledStatus === 200, 'Serverless handler returned 200 for / with Accept: text/markdown');
assert(handledHeaders['Vary'] === 'Accept', 'Serverless handler set Vary: Accept');
assert(handledHeaders['Content-Type'].includes('text/markdown'), 'Serverless handler set Content-Type text/markdown');

// Test 404 on handler for unknown path with Accept: text/markdown
handler({ headers: { accept: 'text/markdown' }, query: { path: '/invalid-path' } }, mockRes);
assert(handledStatus === 404, 'Serverless handler returned 404 for unknown path');
assert(handledHeaders['Content-Type'].includes('text/markdown'), 'Serverless handler 404 returned text/markdown');
assert(handledBody.length >= 20, 'Serverless handler 404 body >= 20 chars');

console.log('\n🎉 ALL AGENT READINESS VERIFICATION TESTS PASSED!');
