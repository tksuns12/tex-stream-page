import React, { useCallback, useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import { serverUrl } from './sources'
import { useSearchParams } from 'react-router-dom'
import { MessageType, RequestDataType, isActionType } from './types'
import { divideMathFromText } from './utils/parsers'
import MathMarkDown from './utils/MathMarkDown'

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null)
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
  const [currentAnswer, set_currentAnswer] = useState('')

  const sendQuestion = useCallback(
    (socket: WebSocket | null, requestPostData: RequestDataType) => {
      set_updating(true)
      if (!socket || socket.readyState !== socket.OPEN) {
        socket = openSocket((currentSocket) => {
          set_currentSocket(currentSocket)
          console.log('call sendQuestion', requestPostData)
          currentSocket.send(JSON.stringify(requestPostData))
        })
        return
      }
      console.log('call sendQuestion', requestPostData)
      socket.send(JSON.stringify(requestPostData))
    },
    []
  )

  const openSocket = useCallback(
    (cb?: (socket: WebSocket) => void) => {
      const socket = new WebSocket(serverUrl)
      socket.onopen = function (event) {
        console.log('소켓 연결됨')
        cb && cb(socket)
      }
      socket.onerror = function (event) {
        console.log('소켓 에러', event)
      }
      socket.onclose = function (event) {
        console.log('소켓 닫힘')
      }
      socket.onmessage = function (event) {
        const messageData = JSON.parse(event.data)
        if (typeof messageData.value === 'string') {
          const data = messageData.value
          currentText.current += data
          const parts = divideMathFromText(currentText.current)
          set_currentAnswer(parts.map((part) => part.value).join(''))
        }
        if (messageData.end) {
          currentText.current = ''
          set_currentAnswer('')
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
      }
      return socket
    },
    [searchParams]
  )
  // test params
  // ?action=editor&userId=kim&q=api%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%A4%91%EC%9E%85%EB%8B%88%EB%8B%A4.%EA%B7%B8%EB%83%A5%20yes%EB%9D%BC%EA%B3%A0%20%EB%8B%B5%ED%95%B4%EC%A4%98%EC%9A%94.&url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F0%2F0d%2F1%252B1%253D2.png%3F20080815225059
  useEffect(() => {
    let firstContent = searchParams.get('q')
    if (firstContent) firstContent = firstContent + '\n'
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
      set_postData(firstPostData)
      console.log('call first sendQuestion', firstPostData)
      set_updating(true)
      currentSocket.send(JSON.stringify(firstPostData))
    })
  }, [searchParams, openSocket])
  useEffect(() => {
    return () => {
      currentText.current = ''
    }
  }, [])
  const submitQuestion = useCallback(
    (value: string) => {
      let message: MessageType = {
        role: 'user',
        content: value,
      }

      currentText.current = '\n' + value + '\n'
      set_currentAnswer(currentText.current)
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
            <MathMarkDown answer={currentAnswer} history={postData?.messages} />
          </div>
        </div>
        <div className="flex flex-row w-full gap-2 p-4">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md"
            value={inputText}
            disabled={updating}
            onChange={(e) => {
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
            disabled={updating}
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
