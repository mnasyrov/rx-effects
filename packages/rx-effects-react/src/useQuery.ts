import { useEffect, useState } from 'react';
import { Query, StateQuery } from 'rx-effects';

/**
 * Returns a value which is provided by the query.
 *
 * @param query – a query for a value
 */
export function useQuery<T>(query: Query<T>): T {
  const [value, setValue] = useState<T>(query.get);

  useEffect(() => {
    const subscription = query.value$.subscribe((nextValue) => {
      setValue(nextValue);
    });

    return () => subscription.unsubscribe();
  }, [query.value$]);

  return value;
}

/**
 * Returns a value which is provided by the query.
 *
 * @deprecated Use `useQuery()`. This function will be removed at 0.8 version.
 *
 * @param query – a query for a value
 */
export function useStateQuery<T>(query: StateQuery<T>): T {
  return useQuery(query);
}
