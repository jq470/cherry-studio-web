// OpenAI-compatible fake used only by the chat E2E workflow.
// Exposes /v1/models and /v1/chat/completions (SSE when stream=true).
'use strict';

const http = require('http');

const PORT = Number(process.env.FAKE_PORT || 9100);
const MODEL = 'fake-model';

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      });
      res.end();
      return;
    }
    if (url.pathname.endsWith('/models')) {
      json(res, 200, {
        object: 'list',
        data: [{ id: MODEL, object: 'model', created: 1, owned_by: 'fake' }],
      });
      return;
    }
    if (url.pathname.endsWith('/chat/completions')) {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        let stream = false;
        try {
          stream = JSON.parse(body).stream === true;
        } catch {
          /* ignore */
        }
        if (!stream) {
          json(res, 200, {
            id: 'chatcmpl-fake',
            object: 'chat.completion',
            created: 1,
            model: MODEL,
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: '**pong** from fake provider' },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
          });
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        const chunks = ['**p', 'on', 'g**', ' from', ' fake', ' provider'];
        let i = 0;
        const timer = setInterval(() => {
          if (i < chunks.length) {
            res.write(
              `data: ${JSON.stringify({
                id: 'chatcmpl-fake',
                object: 'chat.completion.chunk',
                created: 1,
                model: MODEL,
                choices: [{ index: 0, delta: { content: chunks[i] }, finish_reason: null }],
              })}\n\n`,
            );
            i += 1;
            return;
          }
          res.write(
            `data: ${JSON.stringify({
              id: 'chatcmpl-fake',
              object: 'chat.completion.chunk',
              created: 1,
              model: MODEL,
              choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
            })}\n\n`,
          );
          res.write('data: [DONE]\n\n');
          res.end();
          clearInterval(timer);
        }, 100);
      });
      return;
    }
    json(res, 404, { error: { message: 'not found' } });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`[fake-openai] :${PORT}`));
