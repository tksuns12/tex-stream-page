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
function escapeDollar(math: string) {
  // return math.replace(/\$/g, '\\$')
  return math.replace(/\$/g, '') // remove dollar sign
}
function spaceMath(math: string) {
  return math.replace(/\s/g, '\\space ')
}
export default function KatexComp({
  math,
  isBlock,
}: {
  math: string
  isBlock?: boolean
}) {
  const mathRef = useRef(null)
  useEffect(() => {
    if (mathRef.current) {
      katex.render(
        spaceMath(escapeDollar(removeDelimiters(math))),
        mathRef.current,
        {
          throwOnError: false,
          displayMode: isBlock,
          strict: (
            errorCode: unknown,
            errorMessage: unknown,
            token: unknown
          ) => {
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
