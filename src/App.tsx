import React, { useCallback, useEffect, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import { serverUrl } from './sources'
import { MessageType, RequestDataType, isActionType } from './types'
import MathMarkDown from './utils/MathMarkDown'
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks'
import { addAssistantMessage, selectMessage } from './store/messageSlice'

export default function App({data}: {data: RequestDataType}) {
  const dispatch = useAppDispatch()
  const globalMessage = useAppSelector(selectMessage)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentText = useRef('')
  const [updating, set_updating] = useState(false)
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
          window.sendBodyScrollHeight()
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
          dispatch(addAssistantMessage({
            messages: messageData.messages,
            requestId: messageData.requestID
          }))
          set_updating(false)
          window.sendBodyScrollHeight()
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
    []
  )
  
  useEffect(() => {
    if (!data) return
    const action = data.action ?? 'editor'
    const userId = data.userId
    const imageUrl = data.messages?.[0]?.imageUrl?.[0]
    const firstContent = data.messages?.[0]?.content ?? ''
    if (!imageUrl || !userId || !firstContent) return
    if (!isActionType(action)) return
    const firstMessage: MessageType = {
      role: 'user',
      content: firstContent,
      imageUrl: [imageUrl],
    }
    const firstPostData: RequestDataType = {
      action,
      userId: userId,
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
  }, [openSocket])
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
      // sendQuestion(currentSocket, nextPostData)
      window.addMessage(message)
      set_inputText('')
    },
    [currentSocket, postData, sendQuestion]
  )
  useEffect(() => {
    if(globalMessage.messages.length <= 1) return
    const messageLastIndex = globalMessage.messages.length - 1
    const lastMessage = globalMessage.messages[messageLastIndex]
    if(lastMessage.role !== 'user') return
    sendQuestion(currentSocket, globalMessage)
  },[globalMessage, currentSocket, sendQuestion])
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
          {/* !TEST 영역 */}
          {/* <button
            disabled={updating || !inputText}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            onClick={() => {
              submitQuestion(inputText)
            }}
          >
            전송
          </button> */}
        </div>
      </div>
    </div>
  )
}
