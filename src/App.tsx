import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import remarkParse from 'remark-parse'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeMathJax from 'rehype-mathjax/svg'
import { InlineMath } from 'react-katex'
import rehypeKaTeX from 'rehype-katex'
import 'katex/dist/katex.min.css'

const serverUrl = `wss://22v7kvbp5b.execute-api.ap-northeast-2.amazonaws.com/prod/`
const question = `시각 \\( t=0 \\) 일 때 동시에 원점을 출발하여 수직선 위를 움직이는 두 점 \\( \\mathrm{P}, \\mathrm{Q} \\) 의 시각 \\( t(t \\geq 0) \\) 에서의 속도가 각각\n\\[\nv_{1}(t)=t^{2}-6 t+5, \\quad v_{2}(t)=2 t-7\n\\]\n\n이다. 시각 \\( t \\) 에서의 두 점 \\( \\mathrm{P}, \\mathrm{Q} \\) 사이의 거리를 \\( f(t) \\) 라 할 때, 함수 \\( f(t) \\) 는 구간 \\( [0, a] \\) 에서 증가하고, 구간 \\( [a, b] \\) 에서 감소하고, 구간 \\( [b, \\infty) \\) 에서 증가한다. 시각 \\( t=a \\) 에서 \\( t=b \\) 까지 점 \\( \\mathrm{Q} \\) 가 움직인 거리는? (단, \\( 0<a<b \\) ) [4점]\n(1) \\( \\frac{15}{2} \\)\n(2) \\( \\frac{17}{2} \\)\n(3) \\( \\frac{19}{2} \\)\n(4) \\( \\frac{21}{2} \\)\n(5) \\( \\frac{23}{2} \\)`

const data = {
  action: 'editor',
  userId: 'string',
  messages: [
    {
      role: 'user',
      content: question,
      imageUrl: [
        'https://mathtutor-wim-staging.s3.ap-northeast-2.amazonaws.com/latex/assets/고등/수학Ⅱ/3.적분/수학Ⅱ정적분의활용/상/f91a8514-e5e2-4c28-a5e8-bf7c26fba762.jpg',
      ],
    },
  ],
}
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
  const [parts, setParts] = useState<
    {
      type: string
      value: string
    }[]
  >([])
  const currentText = useRef('')
  const allParts = useRef('')
  useEffect(() => {
    const socket = new WebSocket(serverUrl)
    socket.onopen = function (event) {
      console.log('Connection established')
      socket.send(JSON.stringify(data))
    }
    socket.onclose = function (event) {
      console.log('Connection closed')
    }
    socket.onmessage = function (event) {
      const messageData = JSON.parse(event.data)
      if (typeof messageData.value === 'string') {
        const data = messageData.value
        currentText.current += data
        const parts = divideMathFromText(currentText.current)
        setParts(parts)
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
    // 윈도우 스크롤 항상 맨 아래로
    window.scrollTo(0, document.body.scrollHeight)
  })
  return (
    <div className="math-wrap w-full whitespace-pre-line">
      <div
        className={`prose prose-sm prose-slate w-full 
      max-w-full md:prose-base lg:prose-lg whitespace-pre-line`}
      >
        {!answer && <>{'답변 대기중 ...'}</>}
        {/* {parts.map((part, index) => {
          return (
            <Fragment key={index}>
              {part.type === 'Math' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkParse, remarkMath]}
                  rehypePlugins={[remarkRehype, rehypeMathJax, rehypeStringify]}
                >
                  {part.value}
                </ReactMarkdown>
              ) : part.type === 'Waiting' ? (
                <span className="text-red-600">{part.value}</span>
              ) : (
                <span className="text-blue-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkParse, remarkMath]}
                    rehypePlugins={[remarkRehype, rehypeKaTeX, rehypeStringify]}
                  >
                    {part.value}
                  </ReactMarkdown>
                </span>
              )}
            </Fragment>
          )
        })} */}
        <ReactMarkdown
          remarkPlugins={[remarkParse, remarkMath]}
          rehypePlugins={[remarkRehype, rehypeMathJax, rehypeStringify]}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  )
}
