용량이 엄청난데, 최적화는 일단 나중에 고려하는걸로

## Install

```bash
npm install
npm run build

# or
yarn
yarn build

# dist 폴더에 빌드된 파일이 생성됩니다.
# ttf나 woff같은 파일은 수학 기호를 위한 폰트인것 같네요.

```

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

<br/>
-
<br/>

<i>TEST 영역 주석은 Flutter에서 동작하길 원하는 코드는 웹에서 구현한 것</i>

<i>`postMessage`는 Flutter에서 `onMessageReceived`로 받을 겁니다.</i>