import { useEffect, useState } from 'react';
import { Query } from 'rx-effects';

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
