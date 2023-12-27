import ReactDOM from 'react-dom/client'
import React from 'react'
import { RequestDataType } from './types';
import App from './App';
import './input.css'
import { store } from './store';
import { addMessage, setFirstData } from './store/messageSlice';
import { Provider } from 'react-redux';


window.callGPT = function(data) {
  store.dispatch(setFirstData({
    action: data.action,
    userId: data.userId,
    messages: data.messages
  }))
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<Provider store={store}><App data={data} /></Provider>)
};
window.addMessage = function(data) {
  store.dispatch(addMessage(data))
}
window.sendBodyScrollHeight = function() {
  const height = document.body.scrollHeight
  if(!window.Flutter) return
  window.Flutter.postMessage(JSON.stringify({type: 'scrollHeight', height}))
}
window.onload = function() {
  window.sendBodyScrollHeight()
}

// !TEST 영역
// const testButton = document.createElement('button')
// testButton.innerText = 'test 버튼'
// testButton.onclick = function () {
//   const data: RequestDataType = {
//     action: 'editor',
//     userId: 'test-userId',
//     messages: [{
//       role: 'user',
//       content: '테스트 메시지 입니다. 이미지의 문제 풀어주세요.',
//       imageUrl:['https://www.ikbc.co.kr/data/kbc/cache/2023/11/16/kbc202311160197.500x.0.jpg']
//     }],
//   }
//   window.callGPT(data)
//   testButton.remove()
// }
// document.body.appendChild(testButton)
