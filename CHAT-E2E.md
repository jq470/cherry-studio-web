# Chat end-to-end report

- url: http://127.0.0.1:8100/?e2e=1
- verdict: FAIL
- reply seen: false
- failure screenshot: /tmp/chat-e2e-failure.png

## steps
```
ok   boot — Welcome to Cherry Connect your AI service or sync your existing setup from your computer. Connect a provider Sync from desktop Set up later Cherry Studio Privacy and data Cherry Studio collects a small amount of anonymous data to understand
ok   privacy accept
ok   skip setup
ok   home reached — Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel 🍒 What should we create together today? Camera Photos File Plugins Skills Select model AI-generated content, for reference only 🍒 Ch
ok   provider page — Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel Configure deepseek deepseek API keys Add How to get an API key Advanced API address api.deepseek.com API format OpenAI Chat Continue E
ok   api key typed
ok   key added
ok   provider continue
ok   model sync page — Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel Sync models Finish setup Models to add 4 Select all fake-model DeepSeek V4.1 Flash DeepSeek V4 Flash DeepSeek V4 Pro
ok   models selected
ok   setup finished
ok   provider saved — Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel Model service Enabled (1) deepseek Disabled (8) CherryIN OAuth Silicon AiHubMix ZhiPu OpenRout
ok   model picker opened
FAIL model picked
FAIL message typed — no composer input
ok   send clicked
FAIL reply received — (no reply)
```

## page text (last)
```
Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel Model service Enabled (1) deepseek Disabled (8) CherryIN OAuth Silicon AiHubMix ZhiPu OpenRouter OAuth Anthropic OpenAI Gemini deepseek enabled deepseek enabled
```
