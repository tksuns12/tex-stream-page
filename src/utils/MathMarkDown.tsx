import React, { useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeMathJax from 'rehype-mathjax/svg'
import { MessageType } from '../types'
import { divideMathFromText } from './parsers'
import rehypeKatex from 'rehype-katex'

const parseToMath = (content: string) => {
  if (!content) return ''
  const parts = divideMathFromText(content)
  return parts.map((part) => part.value).join('')
}

export default function MathMarkDown({
  history = [],
  parserType = 'mathjax',
}: {
  history?: MessageType[],
  parserType?: 'mathjax' | 'katex'
}) {
  const answerMessage = useMemo(() => {
    const historyMessages = history
      .map((message) => {
        if (message.role === 'user') {
          return '#### ' + parseToMath(message.content)
        } else {
          return parseToMath(message.content)
        }
      })
      .join(` \n `)
    return historyMessages
  }, [history])
  return (
    <ReactMarkdown
      remarkPlugins={[remarkParse, remarkMath]}
      rehypePlugins={[remarkRehype, parserType === 'mathjax'? rehypeMathJax : rehypeKatex, rehypeStringify]}
      components={{
        text: ({ node, children, ...props }) => {
          return (
            <text {...props}>
              <span className="text">{children}</span>
            </text>
          )
        },
        p: ({ node, children, ...props }) => {
          return <p {...props}>{children}</p>
        },
      }}
    >
      {answerMessage}
    </ReactMarkdown>
  )
}
