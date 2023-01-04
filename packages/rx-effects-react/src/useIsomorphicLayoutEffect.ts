import { useEffect, useLayoutEffect } from 'react';

declare const window: any;

const IS_BROWSER = typeof window !== 'undefined';

/**
 * Prevent React warning when using useLayoutEffect on server.
 */
export const useIsomorphicLayoutEffect = IS_BROWSER
  ? useLayoutEffect
  : /* istanbul ignore next: both are not called on server */
    useEffect;
