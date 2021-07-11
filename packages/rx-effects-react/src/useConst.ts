/* eslint-disable @typescript-eslint/ban-types */

import { useRef } from 'react';

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
