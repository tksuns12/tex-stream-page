import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import remarkParse from 'remark-parse'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeMathJax from 'rehype-mathjax/svg'
import rehypeKaTeX from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { serverUrl, data, testAnswer } from './sources'
import { divideMathFromText } from './utils/parsers'
import { ResponseType } from './types'

export default function TestPage() {
  const [answer, setAnswer] = useState('')
  const [rendererType, set_rendererType] = useState<'MathJax' | 'KaTeX'>(
    'MathJax'
  )
  const [clientMessage, set_clientMessage] = useState<string>('')
  const [response, set_response] = useState<ResponseType | null>(null)
  const currentText = useRef('')
  const [currentSocket, set_currentSocket] = useState<WebSocket | null>(null)
  const openSocket = useCallback((cb?: (socket: WebSocket) => void) => {
    const socket = new WebSocket(serverUrl)

    socket.onopen = function (event) {
      set_clientMessage(`소켓 연결됨`)
      cb && cb(socket)
    }
    socket.onclose = function (event) {
      set_clientMessage(`소켓 닫힘`)
    }
    socket.onmessage = function (event) {
      set_clientMessage('')
      const messageData = JSON.parse(event.data)
      if (typeof messageData.value === 'string') {
        const data = messageData.value
        currentText.current += data
        const parts = divideMathFromText(currentText.current)
        setAnswer(parts.map((part) => part.value).join(''))
      }
      if (messageData.end) {
        console.log('messageData', messageData)
        set_response(messageData)
      }
    }
    return socket
  }, [])
  const getWithSocket = useCallback((socket: WebSocket) => {
    if (socket.readyState !== socket.OPEN) {
      socket = openSocket((currentSocket) => {
        set_clientMessage(`답변 대기중 ...`)
        currentSocket.send(JSON.stringify(data))
      })
      return
    }
    set_clientMessage(`답변 대기중 ...`)
    socket.send(JSON.stringify(data))
  }, [])
  useEffect(() => {
    const socket = openSocket()
    set_currentSocket(socket)
    return () => {
      socket.close()
      set_currentSocket(null)
      set_response(null)
    }
  }, [openSocket])
  function getAnswer() {
    currentText.current = testAnswer
    const parts = divideMathFromText(testAnswer)
    setAnswer(parts.map((part) => part.value).join(''))
  }
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [response, answer])
  return (
    <div className="w-full whitespace-pre-line math-wrap">
      <div
        className={`prose prose-sm prose-slate w-full 
      max-w-full md:prose-base lg:prose-lg whitespace-pre-line`}
      >
        <div className="sticky top-0 z-20 flex items-center gap-4 p-2 bg-white shadow-sm shadow-gray-200">
          <button
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            onClick={getAnswer}
          >
            로컬 테스트
          </button>
          <button
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            onClick={() => {
              if (!currentSocket) return
              currentText.current = ''
              set_clientMessage(`연결 시작 ...`)
              getWithSocket(currentSocket)
            }}
          >
            시작
          </button>
          <button
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            onClick={() => {
              if (!currentSocket) return
              currentSocket.close()
            }}
          >
            종료
          </button>
          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={() => {
              console.log('currentText', JSON.stringify(currentText.current))
              console.log('answer', response)
            }}
          >
            원본 출력(console)
          </button>

          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={() => {
              console.log('allParts', JSON.stringify(answer))
            }}
          >
            파싱 출력(console)
          </button>
          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={() => {
              set_rendererType(rendererType === 'MathJax' ? 'KaTeX' : 'MathJax')
            }}
          >
            타입 변경
          </button>
          <div>{`(렌더링 타입: ${rendererType}) ${clientMessage}`}</div>
        </div>
        {/* <KatexComp
          math={``}
        /> */}
        <ReactMarkdown
          remarkPlugins={[remarkParse, remarkMath]}
          rehypePlugins={[
            remarkRehype,
            rendererType === 'KaTeX' ? rehypeKaTeX : rehypeMathJax,
            rehypeStringify,
          ]}
          components={{
            text: ({ node, children, ...props }) => {
              return (
                <text {...props}>
                  <span>{children}</span>
                </text>
              )
            },
            p: ({ node, children, ...props }) => {
              return (
                <p {...props}>
                  {typeof children === 'string'
                    ? // <KatexComp math={children} /> // 처리되지 않은 수식까지 처리 하려면 이렇게
                      children
                    : children}
                </p>
              )
            },
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  )
}
