
export type ResponseType = {
  requestID: string
  end: boolean
  messages: MessageType[]
}


export type ParsedType = 'text' | 'MathInline' | 'MathBlock' | 'Waiting'
export type PartItem = {
  type: ParsedType
  value: string
}
const actionTypes = ["editor", "vision", "thread", "threads1"] as const
export type ApiActionType = typeof actionTypes[number]

export type MessageType = {
  role: "user" | "assistant"
  content: string
  imageUrl?: string[]
}
export const isActionType = (action: string): action is ApiActionType => {
  return actionTypes.includes(action as ApiActionType)
}

export type RequestDataType = {
  action: ApiActionType,
  userId: string,
  questionId?: string,
  requestId?: string,
  messages: MessageType[]
}