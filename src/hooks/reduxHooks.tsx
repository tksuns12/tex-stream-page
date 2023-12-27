import {
  shallowEqual,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux'
import { AppDispatch, RootState } from '../store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
/**
 *
 *
 * @export
 * @template TState
 * @template TSelected
 * @param {(state: TState) => TSelected} selector
 * @return {*}  {TSelected}
 */
export function useShallowSelector<TState = RootState, TSelected = unknown>(
  selector: (state: TState) => TSelected
): TSelected {
  return useSelector(selector, shallowEqual)
}
const hooks = { useAppDispatch, useShallowSelector }
export default hooks
