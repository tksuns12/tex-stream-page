import React, { useEffect, useRef, useState } from 'react'
import remarkParse from 'remark-parse'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeMathJax from 'rehype-mathjax/svg'
import rehypeKaTeX from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { serverUrl, data } from './sources'

function divideMathFromText(text: string) {
  const pattern = /\\\[(.*?)\\\]|\\\((.*?)\\\)|\$\$(.*?)\$\$/gs
  text = text.replace(/₩/g, '\\')
  let lastIndex = 0
  const parts = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    let value = ''
    if (match[1]) {
      // \\[ ... \\] -> $$ ... $$
      value = `$${match[1]}$`
    } else if (match[2]) {
      // \\( ... \\) -> $ ... $
      value = `$${match[2]}$`
    } else if (match[3]) {
      // $$ ... $$ -> $ ... $
      value = `$${match[3]}$`
    }
    parts.push({ type: 'Math', value })

    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) {
    const lastText = text.slice(lastIndex)
    const incompletePattern = /(\$\$|\$|\\\(|\\\[)(?:(?!\$|\\\)|\\\]).)*$/m
    const incompleteMatch = incompletePattern.exec(lastText)
    if (incompleteMatch) {
      const waitingPart = lastText.slice(0, incompleteMatch.index) + '(...)'
      parts.push({
        type: 'Waiting',
        value: waitingPart,
      })
    } else {
      parts.push({ type: 'text', value: lastText })
    }
  }
  return parts
}
export default function App() {
  const [answer, setAnswer] = useState('')
  const [rendererType, set_rendererType] = useState<'MathJax' | 'KaTeX'>(
    'MathJax'
  )
  const currentText = useRef('')
  const allParts = useRef('')
  useEffect(() => {
    const socket = new WebSocket(serverUrl)
    socket.onopen = function (event) {
      console.log('Connection established')
      socket.send(JSON.stringify(data))
    }
    socket.onclose = function (event) {
      console.log('closed')
    }
    socket.onmessage = function (event) {
      const messageData = JSON.parse(event.data)
      if (typeof messageData.value === 'string') {
        const data = messageData.value
        currentText.current += data
        const parts = divideMathFromText(currentText.current)
        allParts.current = parts.map((part) => part.value).join('')
        setAnswer(allParts.current)
      }
      if (messageData.end) {
        console.log('end', messageData)
      }
    }
    return () => {
      socket.close()
    }
  }, [])
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  })
  return (
    <div className="math-wrap w-full whitespace-pre-line">
      <div
        className={`prose prose-sm prose-slate w-full 
      max-w-full md:prose-base lg:prose-lg whitespace-pre-line`}
      >
        <div className="flex gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              console.log('currentText', currentText.current)
            }}
          >
            원본 출력
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              console.log('allParts', allParts.current)
            }}
          >
            파싱 출력
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              set_rendererType(rendererType === 'MathJax' ? 'KaTeX' : 'MathJax')
            }}
          >
            타입 변경 ({rendererType} 사용 중)
          </button>
        </div>
        {!answer && <div>{`(${rendererType} 테스트) 답변 대기중 ...`}</div>}
        <ReactMarkdown
          remarkPlugins={[remarkParse, remarkMath]}
          rehypePlugins={[
            remarkRehype,
            rendererType === 'KaTeX' ? rehypeKaTeX : rehypeMathJax,
            rehypeStringify,
          ]}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  )
}
