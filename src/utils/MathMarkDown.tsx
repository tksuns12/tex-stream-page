import React, { useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeMathJax from 'rehype-mathjax/svg'
import { MessageType } from '../types'
import { divideMathFromText } from './parsers'

const parseToMath = (content: string) => {
  if (!content) return ''
  const parts = divideMathFromText(content)
  return parts.map((part) => part.value).join('')
}

export default function MathMarkDown({
  history = [],
  answer,
}: {
  history?: MessageType[]
  answer: string
}) {
  const answerMessage = useMemo(() => {
    if (!history) return `\n` + answer + `\n`
    const historyMessages = history
      .map((message) => {
        return message.content ? parseToMath(message.content) : ''
      })
      .join(` \n `)
    return historyMessages + answer + `\n`
  }, [answer, history])
  return (
    <ReactMarkdown
      remarkPlugins={[remarkParse, remarkMath]}
      rehypePlugins={[remarkRehype, rehypeMathJax, rehypeStringify]}
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
