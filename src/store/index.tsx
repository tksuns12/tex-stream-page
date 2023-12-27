import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import messageSlice from './messageSlice'
export const store = configureStore({
  reducer: {
    message: messageSlice,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: true }),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
