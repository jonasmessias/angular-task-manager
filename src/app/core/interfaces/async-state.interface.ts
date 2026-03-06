export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function initialAsyncState<T>(emptyValue: T): AsyncState<T> {
  return { data: emptyValue, loading: false, error: null };
}
