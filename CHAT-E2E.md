# Chat end-to-end report

- url: http://127.0.0.1:8100/?e2e=1
- verdict: FAIL
- reply seen: false
- failure screenshot: CHAT-E2E-FAILURE.png

## steps
```
ok   boot — Welcome to Cherry Connect your AI service or sync your existing setup from your computer. Connect a provider Sync from desktop Set up later Privacy and data Cherry Studio collects a small amount of anonymous data to understand how its featu
ok   privacy accept
ok   connect provider
ok   provider catalog — Choose a provider Step 1 of 3 Choose the service your API key belongs to. Recommended CherryIN OAuth CherryIN - AI model provider Silicon Silicon - AI model provider AiHubMix AiHubMix - AI model provider ZhiPu ZhiPu - AI model provider deep
ok   provider chosen
ok   provider page — Configure deepseek Step 2 of 3 Connect using your own API key. deepseek API keys Add How to get an API key Advanced API address api.deepseek.com API format OpenAI Chat Continue Enter an API key to continue enabling this provider.
ok   api key typed
ok   key added
ok   provider continue
ok   model screen — Choose a chat model Edit connection Step 3 of 3 DeepSeek V4 Flash deepseek-v4-flash DeepSeek V4 Pro deepseek-v4-pro DeepSeek V4.1 Flash deepseek-flash fake-model fake-model A connection check runs before starting; a small charge may apply. 
ok   model picked
ok   onboarding start
ok   home composer — http://127.0.0.1:8100/?agentId=be186011-8cc2-464a-94a4-4b309c7bb989
ok   message typed — {"value":"ping","disabled":null}
ok   send clicked — api requests: 3
ok   after send — http://127.0.0.1:8100/api.deepseek.com/v1/chat/completions | http://127.0.0.1:8100/api.deepseek.com/v1/chat/completions :: Agents Drawings Plugins Skills Files Sessions Cherry Studio Cherry Studio New chat Cancel Camera Photos File Plugins Skills fake-model AI-generated content, for reference only 🍒 Cherie
FAIL reply received — (no reply)
```

## console errors
```
```

## model screen text
```

```

## page text (last)
```
Agents Drawings Plugins Skills Files Sessions Cherry Studio Cherry Studio New chat Cancel Camera Photos File Plugins Skills fake-model AI-generated content, for reference only 🍒 Cherie
```
