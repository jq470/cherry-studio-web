// Cloudflare Worker equivalent of server/cors-proxy.js.
//
// Deploy on the same origin as the SPA and route /<host>/<path> through it:
// the boot gate rewrites raw.githubusercontent.com / api.gitcode.com requests
// to that shape because those hosts send no CORS headers.

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const match = url.pathname.match(/^\/([^/]+)(\/.*)?$/);
    const host = match && match[1];
    if (!host || !/^\.?[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host)) {
      return new Response('not found', { status: 404 });
    }

    const target = `https://${host}${match[2] || '/'}${url.search}`;
    const headers = new Headers(request.headers);
    headers.delete('origin');
    headers.delete('referer');
    headers.delete('cookie');
    headers.set('host', host);

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
