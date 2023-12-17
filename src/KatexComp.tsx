import katex from 'katex'
import React, { useEffect, useRef } from 'react'

export default function KatexComp({ math }: { math: string }) {
  const mathRef = useRef(null)
  useEffect(() => {
    if (mathRef.current) {
      katex.render(math, mathRef.current, {
        throwOnError: false,
        strict: (errorCode: unknown, errorMessage: unknown, token: unknown) => {
          console.log('token', token)
          if (errorCode === 'unicodeTextInMathMode') {
            return 'ignore'
          }
          return 'warn'
        },
      })
    }
  }, [math])

  return <span ref={mathRef}></span>
}
