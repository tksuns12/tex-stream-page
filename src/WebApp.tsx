import React, { useCallback, useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import { serverUrl } from './sources'
import { useSearchParams } from 'react-router-dom'
import { MessageType, RequestDataType, isActionType } from './types'
import MathMarkDown from './utils/MathMarkDown'



// window 객체에 yourJavascriptFunction 함수 추가
window.callGPT = function(data: RequestDataType) {
  data
  // 여기에 필요한 로직을 추가할 수 있음
};
export default function WepApp() {
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentText = useRef('')
  const [updating, set_updating] = useState(false)
  const [searchParams] = useSearchParams()
  const [postData, set_postData] = useState<RequestDataType>({
    action: 'editor',
    userId: '',
    messages: [],
  })
  const [inputText, set_inputText] = useState('')
  const [currentSocket, set_currentSocket] = useState<WebSocket | null>(null)

  const sendQuestion = useCallback(
    (socket: WebSocket | null, requestPostData: RequestDataType) => {
      set_updating(true)
      currentText.current = ''
      set_postData({
        ...requestPostData,
        messages: [
          ...requestPostData.messages,
          { role: 'assistant', content: '' },
        ],
      })
      if (!socket || socket.readyState !== socket.OPEN) {
        socket = openSocket((currentSocket) => {
          set_currentSocket(currentSocket)
          currentSocket.send(JSON.stringify(requestPostData))
        })
        return
      }
      socket.send(JSON.stringify(requestPostData))
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight
        }
      }, 10)
    },
    []
  )

  const openSocket = useCallback(
    (cb?: (socket: WebSocket) => void) => {
      const socket = new WebSocket(serverUrl)
      socket.onopen = function (event) {
        cb && cb(socket)
      }
      socket.onerror = function (event) {}
      socket.onclose = function (event) {}
      socket.onmessage = function (event) {
        const messageData = JSON.parse(event.data)
        if (typeof messageData.value === 'string') {
          const data = messageData.value
          currentText.current += data
          set_postData((prev) => {
            if (!prev) return prev
            let lastUserIndex = prev.messages.length - 1
            const nextMessages: MessageType[] =
              prev.messages[lastUserIndex]?.role === 'assistant'
                ? prev.messages.map((message, index) => {
                    if (index === lastUserIndex) {
                      return {
                        ...message,
                        content: currentText.current,
                      }
                    }
                    return message
                  })
                : prev.messages
            return {
              ...prev,
              requestId: messageData.requestID,
              messages: nextMessages,
            }
          })
        }
        if (messageData.end) {
          currentText.current = ''
          set_postData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              requestId: messageData.requestID,
              messages: messageData.messages,
            }
          })
          set_updating(false)
        }
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight
        }
        if (inputRef.current) {
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus()
          }, 10)
        }
      }
      return socket
    },
    [searchParams]
  )
  // test params
  // ?action=editor&userId=kim&q=api%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%A4%91%EC%9E%85%EB%8B%88%EB%8B%A4.%EA%B7%B8%EB%83%A5%20yes%EB%9D%BC%EA%B3%A0%20%EB%8B%B5%ED%95%B4%EC%A4%98%EC%9A%94.&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F0%2F0d%2F1%252B1%253D2.png%3F20080815225059
  useEffect(() => {
    let firstContent = searchParams.get('q')
    if (firstContent) firstContent = firstContent
    const action = decodeURIComponent(searchParams.get('action') ?? 'editor')
    const userId = searchParams.get('userId')
    const imageUrl = searchParams.get('url')
    if (!firstContent || !imageUrl || !userId) return
    if (!isActionType(action)) return
    const firstMessage: MessageType = {
      role: 'user',
      content: decodeURIComponent(firstContent),
      imageUrl: [decodeURIComponent(imageUrl)],
    }
    const firstPostData: RequestDataType = {
      action,
      userId: decodeURIComponent(userId),
      messages: [firstMessage],
    }
    openSocket((currentSocket) => {
      set_currentSocket(currentSocket)
      currentText.current = ''
      set_postData({
        ...firstPostData,
        messages: [firstMessage, { role: 'assistant', content: '' }],
      })
      set_updating(true)
      currentSocket.send(JSON.stringify(firstPostData))
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight
      }
    })
  }, [searchParams, openSocket])
  useEffect(() => {
    return () => {
      currentText.current = ''
    }
  }, [])
  const submitQuestion = useCallback(
    (value: string) => {
      value = value
      let message: MessageType = {
        role: 'user',
        content: value,
      }
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      set_inputText('')
      const nextPostData: RequestDataType = {
        ...postData,
        messages: [...postData.messages, message],
      }

      sendQuestion(currentSocket, nextPostData)
      set_inputText('')
    },
    [currentSocket, postData, sendQuestion]
  )
  return (
    <div className="w-full math-wrap">
      <div className="flex flex-col items-center justify-between w-full h-screen flex-column">
        <div
          id="content-overflows"
          ref={contentRef}
          className={`prose prose-sm prose-slate w-full 
      max-w-full md:prose-base lg:prose-lg flex-1 overflow-y-auto`}
        >
          <div className="p-4 whitespace-pre-line">
            <MathMarkDown history={postData?.messages} />
          </div>
        </div>
        <div className="flex flex-row w-full gap-2 p-4">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            disabled={updating}
            onBlur={(e) => {
              set_inputText(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submitQuestion((e.target as HTMLInputElement).value)
              }
            }}
          />
          <button
            disabled={updating || !inputText}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            onClick={() => {
              submitQuestion(inputText)
            }}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
