### window 브릿지 함수 정의 (앱 -> 웹뷰 실행)

- 타입은 global.d.ts에 정의되어 있음

```typescript
window.callGPT: (data: RequestDataType) => void; // index.tsx의 32번줄 참고
window.addMessage: (data: MessageType) => void // App.tsx의 157번줄 submitQuestion 참고
```


### window 브릿지 함수 정의 (웹뷰 -> 앱에서 메시지 받음)

```
postMessage(JSON.stringify({type: 'scrollHeight', height}))
```


---


__TEST 영역 주석은 Flutter에서 동작하길 원하는 코드는 웹에서 구현한 것__

__postMessage는 Flutter에서 onMessageReceived로 받을 겁니다.__