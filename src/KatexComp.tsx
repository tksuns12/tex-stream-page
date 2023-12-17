import katex from 'katex'
import React, { useEffect, useRef } from 'react'
function removeDelimiters(math: string) {
  let removed = math
  removed = removed.replace(/\$\$(.*?)\$\$/gm, '$1')
  removed = removed.replace(/\$(.*?)\$/gm, '$1')
  removed = removed.replace(/\\\((.*?)\\\)/gm, '$1')
  removed = removed.replace(/\\\[(.*?)\\\]/gm, '$1')
  return removed
}
const disposeDollar = {
  escapeDollar: function (math: string) {
    return math.replace(/\$/g, '\\$')
  },
  removeDollar: function (math: string) {
    return math.replace(/\$/g, '')
  },
}
function spaceMath(math: string) {
  return math.replace(/\s/g, '\\space ')
}
export default function KatexComp({
  math,
  isBlock,
  options = {
    // 순서대로 동작함
    deleteDelimiters: true,
    dollar: 'escapeDollar',
  },
}: {
  math: string
  isBlock?: boolean
  options?: {
    deleteDelimiters?: boolean
    dollar?: 'escapeDollar' | 'removeDollar'
  }
}) {
  const handlerName = options?.dollar ?? 'escapeDollar'
  const mathRef = useRef(null)
  useEffect(() => {
    if (mathRef.current) {
      katex.render(
        spaceMath(
          disposeDollar[handlerName](
            options.deleteDelimiters ? removeDelimiters(math) : math
          )
        ),
        mathRef.current,
        {
          throwOnError: false,
          displayMode: isBlock,
          strict: (errorCode: unknown) => {
            if (errorCode === 'unicodeTextInMathMode') {
              return 'ignore'
            }
            return 'warn'
          },
        }
      )
    }
  }, [math])

  return <span ref={mathRef}></span>
}
