/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo } from 'react';
import { Controller } from 'rx-effects';

export function useController<T extends Controller<Record<string, any>>>(
  factory: () => T,
  dependencies?: unknown[],
): T {
  const controller = useMemo(factory, dependencies);
  useEffect(() => controller.destroy, [controller]);

  return controller;
}
