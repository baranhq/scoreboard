"""Check the generated static export; run after an indexable production build."""
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.lang = ''
        self.meta = {}
        self.links = []
        self.anchors = []
        self.text = {'title': [], 'h1': [], 'script': []}
        self.capture = None
        self.buffer = ''
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'html':
            self.lang = attrs.get('lang', '')
        elif tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property', ''))] = attrs.get('content', '')
        elif tag == 'link':
            self.links.append(attrs)
        elif tag == 'a' and attrs.get('href'):
            self.anchors.append(attrs['href'])
        if tag in ('title', 'h1') or tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.capture = tag
            self.buffer = ''

    def handle_data(self, data):
        if self.capture:
            self.buffer += data

    def handle_endtag(self, tag):
        if tag == self.capture:
            self.text[tag].append(self.buffer)
            self.capture = None

    def link(self, relationship):
        return [item.get('href', '') for item in self.links if item.get('rel') == relationship]

    def alternates(self):
        return {item['hreflang']: item.get('href', '') for item in self.links
                if item.get('rel') == 'alternate' and 'hreflang' in item}


root = Path(sys.argv[1] if len(sys.argv) == 2 else 'out').resolve()
if len(sys.argv) > 2 or not (root / 'sitemap.xml').is_file():
    raise SystemExit('Usage: python3 tests/seo-export.py [export-directory] (build first)')

errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


def exported_file(url):
    relative = unquote(urlsplit(url).path).lstrip('/')
    path = root / relative
    if path.is_dir():
        path /= 'index.html'
    return path


ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'x': 'http://www.w3.org/1999/xhtml'}
entries = ET.parse(root / 'sitemap.xml').getroot().findall('s:url', ns)
urls = [entry.findtext('s:loc', namespaces=ns) for entry in entries]
check(len(urls) == 15 and len(set(urls)) == 15, 'Expected 15 unique canonical sitemap URLs')
if not urls:
    raise SystemExit('SEO export checks require an indexable production build')
origin = urlsplit(urls[0]).scheme + '://' + urlsplit(urls[0]).netloc
robots = RobotFileParser()
robots.parse((root / 'robots.txt').read_text(encoding='utf-8').splitlines())
check(origin + '/sitemap.xml' in (robots.site_maps() or []), 'robots.txt must name the sitemap')

slugs = {
    'bg': ('', 'scoreboard', 'pomosht', 'poveritelnost', 'licenzi'),
    'tr': ('', 'scoreboard', 'yardim', 'gizlilik', 'lisanslar'),
    'en': ('', 'scoreboard', 'help', 'privacy', 'licenses'),
}
expected = {origin + f'/{lang}/' + (slug + '/' if slug else '')
            for lang, pages in slugs.items() for slug in pages}
expected.remove(origin + '/en/')
expected.add(origin + '/')
aliases = {origin + '/en/': origin + '/',
           origin + '/scoreboard/': origin + '/en/scoreboard/'}
check(set(urls) == expected, 'Sitemap must include all canonical public routes and no private routes')
pages = {}
for entry, url in zip(entries, urls):
    path = exported_file(url)
    check(path.is_file(), f'{url}: missing exported HTML')
    if not path.is_file():
        continue
    page = Page(path)
    pages[url] = page
    lang = urlsplit(url).path.split('/')[1] or 'en'
    check(page.lang == ('en-GB' if lang == 'en' else lang), f'{url}: incorrect HTML language')
    check(page.link('canonical') == [url], f'{url}: canonical must match the sitemap URL')
    check(len(page.text['h1']) == 1 and bool(page.text['h1'][0].strip()), f'{url}: expected one meaningful H1')
    check(len(page.text['title']) == 1 and bool(page.text['title'][0].strip()), f'{url}: expected one title')
    if page.text['title']:
        check(page.text['title'][0].count("Baran's Scoreboard") == 1, f'{url}: repeated or missing title brand')
    for name in ('description', 'og:title', 'og:description', 'og:image', 'twitter:card'):
        check(bool(page.meta.get(name)), f'{url}: missing {name}')
    check(page.meta.get('og:url') == url, f'{url}: Open Graph URL differs from canonical')
    directives = {item.strip() for item in page.meta.get('robots', '').split(',')}
    check('index' in directives and 'noindex' not in directives, f'{url}: public page is not indexable')
    alternates = page.alternates()
    check(set(alternates) == {'bg', 'tr', 'en', 'en-GB', 'x-default'}, f'{url}: incomplete hreflang set')
    check(alternates.get(lang) == url, f'{url}: missing self-referencing hreflang')
    check(alternates.get('x-default') == alternates.get('en') == alternates.get('en-GB'), f'{url}: inconsistent English fallback')
    sitemap_alternates = {item.attrib.get('hreflang'): item.attrib.get('href')
                          for item in entry.findall('x:link', ns)}
    check(sitemap_alternates == alternates, f'{url}: HTML and sitemap hreflang disagree')
    for agent in ('Googlebot', 'bingbot', 'OAI-SearchBot'):
        check(robots.can_fetch(agent, url), f'{url}: robots.txt blocks {agent}')
    for href in page.anchors:
        target = urljoin(url, href)
        if urlsplit(target).scheme in ('http', 'https') and urlsplit(target).netloc == urlsplit(origin).netloc:
            check(exported_file(target).is_file(), f'{url}: missing internal link target {href}')
    if urlsplit(url).path in ('/', '/bg/', '/tr/'):
        check(len(page.text['script']) == 1, f'{url}: missing application structured data')
        for content in page.text['script']:
            try:
                schema = json.loads(content)
                graph = schema['@graph']
                app = next(item for item in graph if item.get('@type') == 'WebApplication')
                check(schema.get('@context') == 'https://schema.org', f'{url}: incorrect schema context')
                check(app.get('isAccessibleForFree') is True and app.get('offers', {}).get('price') == 0,
                      f'{url}: inaccurate free-app structured data')
                check('aggregateRating' not in app and 'review' not in app, f'{url}: unsupported review markup')
                check(app.get('url') == origin + f'/{lang}/scoreboard/', f'{url}: structured data must link to the localized app')
            except (ValueError, KeyError, TypeError, StopIteration):
                check(False, f'{url}: invalid application structured data')

for url, page in pages.items():
    for alternate in page.alternates().values():
        check(alternate in pages and pages[alternate].alternates() == page.alternates(),
              f'{url}: non-reciprocal or missing alternate {alternate}')

for lang in slugs:
    home_url = origin + ('/' if lang == 'en' else f'/{lang}/')
    app_url = origin + f'/{lang}/scoreboard/'
    if home_url in pages and app_url in pages:
        home = pages[home_url]
        app = pages[app_url]
        check(home.text['title'] != app.text['title'], f'{app_url}: app and landing page need distinct titles')
        check(home.meta.get('description') != app.meta.get('description'), f'{app_url}: app and landing page need distinct descriptions')
        targets = [urljoin(home_url, href) for href in home.anchors]
        check(any(aliases.get(target, target) == app_url for target in targets), f'{home_url}: missing crawlable app link')

for alias, canonical in aliases.items():
    path = exported_file(alias)
    check(path.is_file(), f'{alias}: missing compatibility page')
    if path.is_file():
        page = Page(path)
        check(page.link('canonical') == [canonical], f'{alias}: incorrect compatibility canonical')
        check(page.meta.get('og:url') == canonical, f'{alias}: incorrect compatibility Open Graph URL')
        check(canonical in pages and page.alternates() == pages[canonical].alternates(),
              f'{alias}: incompatible hreflang set')

for path in root.rglob('index.html'):
    relative = '/' + path.relative_to(root).as_posix().removesuffix('index.html')
    if origin + relative not in expected and origin + relative not in aliases:
        check('noindex' in Page(path).meta.get('robots', ''), f'{relative}: noncanonical/private page must be noindex')
for agent in ('Googlebot', 'bingbot', 'OAI-SearchBot'):
    for private in ('/admin/', '/api/'):
        check(not robots.can_fetch(agent, origin + private), f'robots.txt must disallow {private} for {agent}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'SEO export checks passed: {len(pages)} canonical pages, reciprocal hreflang, metadata, '
      'sitemap, robots, JSON-LD, static internal link targets and private-page noindex.')
