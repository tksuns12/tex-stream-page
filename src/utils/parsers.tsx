import { PartItem } from '../types'

export function divideMathFromText(text: string): PartItem[] {
  const pattern = /\\\[(.*?)\\\]|\\\((.*?)\\\)|\$(.*?)\$|\$\$(.*?)\$\$/gs
  text = text.replace(/₩/g, '\\')
  let lastIndex = 0
  const parts: PartItem[] = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    let value = ''
    let type: 'text' | 'MathInline' | 'MathBlock' | 'Waiting' = 'MathInline'
    if (match[1]) {
      // \\[ ... \\] -> $ ... $
      type = 'MathBlock'
      value = `$$${match[1]}$$`
    } else if (match[2]) {
      // \\( ... \\) -> $ ... $
      type = 'MathInline'
      value = `$${match[2]}$`
    } else if (match[3]) {
      // $ ... $ -> $ ... $
      type = 'MathInline'
      value = `$${match[3]}$`
    } else if (match[4]) {
      // $$ ... $$ -> $ ... $
      type = 'MathBlock'
      value = `$$${match[4]}$$`
    }
    parts.push({ type, value })
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
