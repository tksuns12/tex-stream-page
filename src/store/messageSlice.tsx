import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '.'
import { MessageType, RequestDataType } from '../types'

interface messageState {
  data: RequestDataType 
}
const initialState: messageState = {
  data: {
    action: 'editor',
    userId: '',
    messages: []
  }
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setFirstData: (state, action: { payload: RequestDataType }) => {
      state.data = action.payload
    },
    addMessage: (state, action: { payload: MessageType }) => {
      state.data = { ...state.data, messages: [...state.data?.messages ?? [], action.payload] }
    },
    addAssistantMessage: (state, action: { payload: {
      messages: MessageType[],
      requestId: string
    } }) => {
      const { messages, requestId } = action.payload
      state.data = { ...state.data, requestId, messages: [...state.data?.messages ?? [], ...messages] }
    },
    cleanMessage: (state) => {
      state.data = initialState.data
    },
  },
})
export const { setFirstData, addMessage, addAssistantMessage, cleanMessage } = messageSlice.actions

export const selectMessage = (state: RootState) => state.message.data

export default messageSlice.reducer
