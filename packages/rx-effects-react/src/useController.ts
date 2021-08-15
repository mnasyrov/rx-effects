/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo } from 'react';
import { Controller } from 'rx-effects';

/**
 * Creates a controller by the factory and destroys it on unmounting a
 * component
 *
 * The factory is not part of the dependencies by default. It should be
 * included explicitly when it is needed.
 *
 * @param factory a controller factory
 * @param dependencies array of hook dependencies to recreate the controller.
 */
export function useController<T extends Controller<Record<string, any>>>(
  factory: () => T,
  dependencies?: unknown[],
): T {
  const controller = useMemo(factory, dependencies);
  useEffect(() => controller.destroy, [controller]);

  return controller;
}
