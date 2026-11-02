"""Local integration checks. Requires an explicitly supplied disposable DB configuration."""
import http.cookiejar
import http.client
import json
import os
import re
import secrets
import socket
import subprocess
import sys
import time
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit('Usage: python3 tests/http-security.py /absolute/private/test.env')
config = str(Path(sys.argv[1]).resolve())
if not Path(config).is_file():
    raise SystemExit('A private disposable test configuration is required')
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
origin = f'http://127.0.0.1:{port}'
admin_path = '/custom-panel'
def admin_url(query=''):
    return admin_path + query
password = secrets.token_urlsafe(32)
hashed = subprocess.check_output(['php', '-r', 'echo password_hash(stream_get_contents(STDIN),PASSWORD_DEFAULT);'], input=password.encode()).decode()
policy_storage = tempfile.TemporaryDirectory(prefix='scoreboard-policy-test-')
env = dict(os.environ, APP_KEY=secrets.token_hex(32), POLICY_PATH=policy_storage.name, SCOREBOARD_ENV_FILE=config, APP_ORIGIN=origin, APP_ALLOW_HTTP='true', ADMIN_USERNAME='integration-test', ADMIN_PASSWORD_HASH=hashed, ANALYTICS_ENABLED='true', ADMIN_PATH=admin_path)
php = ['php', '-d', 'extension=pdo_mysql']
if os.environ.get('TEST_MYSQL_SOCKET'):
    php += ['-d', 'pdo_mysql.default_socket=' + os.environ['TEST_MYSQL_SOCKET']]
subprocess.run(php + ['-r', "require 'backend/config.php'; require 'backend/security.php'; try {$c=configuration();database($c);start_admin_session($c);}catch(Throwable $e){fwrite(STDERR,get_class($e).' at '.basename($e->getFile()).':'.$e->getLine().PHP_EOL);exit(1);}"], env=env, check=True)
server = subprocess.Popen(php + ['-S', f'127.0.0.1:{port}', '-t', 'out', 'backend/dev-router.php'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

def request(path, data=None, json_body=False, source=origin):
    headers = {}
    if data is not None:
        headers = {'Origin': source, 'Content-Type': 'application/json' if json_body else 'application/x-www-form-urlencoded'}
        data = (json.dumps(data) if json_body else urllib.parse.urlencode(data)).encode()
    try:
        response = opener.open(urllib.request.Request(origin + path, data=data, headers=headers))
    except urllib.error.HTTPError as error:
        response = error
    return response.status, response.read().decode(), response.headers

def request_from_ip(path, data, client_ip):
    body = urllib.parse.urlencode(data).encode()
    cookies = '; '.join(f'{cookie.name}={cookie.value}' for cookie in jar)
    headers = {'Origin': origin, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': str(len(body)), 'Cookie': cookies}
    connection = http.client.HTTPConnection('127.0.0.1', port, timeout=5, source_address=(client_ip, 0))
    connection.request('POST', path, body=body, headers=headers)
    response = connection.getresponse()
    result = (response.status, response.read().decode(), response.headers)
    connection.close()
    return result

def token(html):
    return re.search(r'name="csrf" value="([a-f0-9]+)"', html)[1]

try:
    for _ in range(50):
        try:
            status, html, headers = request(admin_url())
            break
        except urllib.error.URLError:
            time.sleep(.1)
    else:
        raise AssertionError('Local server did not start')
    assert request('/admin')[0] == 404, 'previous/default path must not expose the admin when a custom route is configured'
    assert status == 200 and 'name="password"' in html and 'Recorded visits' not in html, (status, html[:100])
    assert headers['X-Robots-Tag'] == 'noindex, nofollow'
    assert 'httponly' in headers['Set-Cookie'].lower() and 'samesite=strict' in headers['Set-Cookie'].lower() and 'path=/' in headers['Set-Cookie'].lower()
    csrf = token(html)
    assert request(admin_url(), {'action': 'save_policy', 'csrf': csrf})[0] == 401
    assert request(admin_url(), {'action': 'logout', 'csrf': 'wrong'})[0] == 403
    assert request(admin_url(), {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': password}, source='https://attacker.example')[0] == 403
    assert request(admin_url(), {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': 'wrong'})[0] == 401
    status, html, _ = request(admin_url(), {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': password})
    assert status == 200 and 'Recorded visits' in html and 'Administration' in html
    csrf = token(html)
    assert request(admin_url('?from=02.11.2026&to=02.11.2026'))[0] == 200
    assert request(admin_url('?from=31.02.2026&to=02.11.2026'))[0] == 400
    assert request(admin_url(), {'action': 'logout', 'csrf[]': 'bad'})[0] == 403
    for view in ['activity', 'pages', 'clicks', 'privacy', 'settings']:
        assert request(admin_url('?view=' + view))[0] == 200, view
    assert request(admin_url('?view=activity&period%5B%5D=day'))[0] == 400
    assert request(admin_url('?view=%3Cscript%3E'))[0] == 404
    assert request(admin_url(), {'action': 'save_policy', 'csrf': 'bad'})[0] == 403
    policy = json.loads(request('/api/index.php?action=policy&lang=en')[1])
    malicious = '<script>alert(1)</script> ' + 'Plain policy text. ' * 5 + '[bad](javascript:alert(1))'
    update = {'action': 'save_policy', 'csrf': csrf, 'language': 'en', 'revision': policy['revision'], 'title': '<img src=x onerror=alert(1)>', 'content': malicious}
    assert request(admin_url(), update)[0] == 200
    rendered = request('/en/privacy/')[1]
    assert '<script>alert(1)</script>' not in rendered and '&lt;img' in rendered
    assert request(admin_url(), update)[0] == 409

    assert request(admin_url('?view=exclusions'))[0] == 404
    assert request('/api/index.php?action=event', {'type': 'view', 'path': '/en/'}, True)[0] == 403
    visits_before=re.search(r'Recorded visits</dt><dd[^>]*>([0-9]+)',request(admin_url())[1])[1]
    assert request('/api/index.php?action=consent', {'usage': True, 'cloud': False}, True)[0] == 200
    assert request('/api/index.php?action=event', {'type': 'view', 'path': '/en/'}, True)[0] == 200
    assert re.search(r'Recorded visits</dt><dd[^>]*>([0-9]+)',request(admin_url())[1])[1] == visits_before
    admin_cookie=next(c.value for c in jar if c.name=='score_admin')
    for cookie in jar:
        if cookie.name=='score_admin': cookie.value='a'*32
    assert request('/api/index.php?action=event', {'type': 'view', 'path': '/en/'}, True)[0] == 200
    assert 'name="password"' in request(admin_url())[1]
    for cookie in jar:
        if cookie.name=='score_admin': cookie.value=admin_cookie
    assert int(re.search(r'Recorded visits</dt><dd[^>]*>([0-9]+)',request(admin_url())[1])[1]) == int(visits_before)+1

    assert request('/api/_lib/config.php')[0] == 404
    assert request('/baranhq_admin')[0] == 404
    assert request('/api/index.php?action=visits')[0] == 405
    assert request(admin_url(), {'action': 'logout', 'csrf': csrf})[0] == 200
    assert 'name="password"' in request(admin_url('?view=privacy'))[1]
    assert request('/api/index.php?action=consent', {'usage': False, 'cloud': False}, True)[0] == 200
    csrf = token(request(admin_url())[1])
    statuses = [request(admin_url(), {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': 'wrong'})[0] for _ in range(6)]
    assert 429 in statuses, statuses
    api_statuses = [request('/api/index.php?action=consent', {'usage': True, 'cloud': False}, True)[0] for _ in range(299)]
    assert api_statuses[:298] == [200] * 298 and api_statuses[-1] == 429, api_statuses[-3:]
    for _ in range(95):
        request(admin_url(), {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': 'wrong'})
    status, _, headers = request_from_ip(admin_path, {'action': 'login', 'csrf': csrf, 'username': 'integration-test', 'password': password}, '127.0.0.2')
    assert status == 303 and headers['Location'] == admin_path, (status, headers.get('Location'))
    for language, path in [('bg', '/bg/poveritelnost/'), ('tr', '/tr/gizlilik/'), ('en', '/en/privacy/')]:
        status, html, _ = request(path)
        assert status == 200 and 'id="policy-document"' in html and "Baran" in html, language
    print('Local HTTP checks passed: anonymous access, CSRF, origin, login, admin views, malformed input, logout, rate limiting, policy delivery.')
finally:
    server.terminate()
    server.wait(timeout=5)
    policy_storage.cleanup()
