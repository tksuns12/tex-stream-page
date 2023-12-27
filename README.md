### window 브릿지 함수 정의 (앱 -> 웹뷰 실행)

- 타입은 global.d.ts에 정의되어 있음

```typescript
window.callGPT: (data: RequestDataType) => void;
window.addMessage: (data: MessageType) => void
```

### window 브릿지 함수 정의 (웹뷰 -> 앱에서 메시지 받음)

```
postMessage(JSON.stringify({type: 'scrollHeight', height}))
```