# Chat end-to-end report

- url: http://127.0.0.1:8100/?e2e=1
- verdict: FAIL
- reply seen: false


## steps
```
ok   boot — Welcome to Cherry Connect your AI service or sync your existing setup from your computer. Connect a provider Sync from desktop Set up later Cherry Studio Privacy and data Cherry Studio collects a small amount of anonymous data to understand
ok   privacy accept
ok   connect provider
ok   provider catalog — Choose a provider Step 1 of 3 Choose the service your API key belongs to. Show all providers Custom provider
ok   provider chosen
ok   provider page — Configure deepseek Step 2 of 3 Connect using your own API key. deepseek API keys Add How to get an API key Advanced API address api.deepseek.com API format OpenAI Chat Continue Enter an API key to continue enabling this provider.
ok   api key typed
ok   key added
ok   provider continue
ok   model screen — Choose a chat model Edit connection Step 3 of 3 DeepSeek V4 Flash deepseek-v4-flash DeepSeek V4 Pro deepseek-v4-pro DeepSeek V4.1 Flash deepseek-flash fake-model fake-model A connection check runs before starting; a small charge may apply. 
ok   model picked
ok   onboarding start
ok   home composer — http://127.0.0.1:8100/?agentId=2f7b1664-cbd8-4d33-a373-16d979b06942
FAIL exception — Node is either not clickable or not an Element
```

## api responses
```
200 application/json http://127.0.0.1:8100/api.deepseek.com/v1/models
200 text/event-stream http://127.0.0.1:8100/api.deepseek.com/v1/chat/completions
```

## console errors
```
```

## model screen text
```

```

## page text (last)
```

```

## failure screenshot (base64)

