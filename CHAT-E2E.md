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
FAIL home composer — http://127.0.0.1:8100/
FAIL message typed — no composer input
FAIL send clicked
FAIL reply received — (no reply)
```

## console errors
```
Error: Minified React error #130; visit https://react.dev/errors/130?args[]=undefined&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
```

## model screen text
```

```

## page text (last)
```
Something went wrong This screen ran into a problem. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry
```
