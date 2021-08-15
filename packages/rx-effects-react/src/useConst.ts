/* eslint-disable @typescript-eslint/ban-types */

import { useRef } from 'react';

/**
 * Keeps the value as a constant between renders of a component.
 *
 * If the factory is provided, it is called only once.
 *
 * @param initialValue a value or a factory for the value
 */
export function useConst<T>(initialValue: (() => T) | T): T {
  const constRef = useRef<{ value: T } | void>();

  if (constRef.current === undefined) {
    constRef.current = {
      value:
        typeof initialValue === 'function'
          ? (initialValue as Function)()
          : initialValue,
    };
  }

  return constRef.current.value;
}
