// Cloudflare Worker equivalent of server/cors-proxy.js.
//
// Same contract: /<allowlisted-host>/<path> -> https://<allowlisted-host>/<path>.
// Deliberately not an open proxy; extend ALLOW_HOSTS rather than dropping the
// check. Deploy on the same origin as the SPA.

const ALLOW_HOSTS = new Set(['raw.githubusercontent.com', 'objects.githubusercontent.com', 'api.gitcode.com']);

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const segment = (url.pathname.split('/')[1] || '').toLowerCase();
    if (!ALLOW_HOSTS.has(segment)) {
      return new Response('not found', { status: 404 });
    }

    const targetPath = url.pathname.slice(segment.length) || '/';
    const target = `https://${segment}${targetPath}${url.search}`;
    const headers = new Headers(request.headers);
    headers.delete('origin');
    headers.delete('referer');
    headers.delete('cookie');
    headers.set('host', segment);

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'follow',
    });

    const response = new Response(upstream.body, upstream);
    for (const [key, value] of Object.entries(corsHeaders())) response.headers.set(key, value);
    return response;
  },
};

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-max-age': '86400',
  };
}
