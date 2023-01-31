import { declareModule, Token } from 'ditox';
import { DependencyModule, useDependencyContainer } from 'ditox-react';
import React, { FC, useEffect, useMemo } from 'react';
import {
  Controller,
  ControllerFactory,
  createStore,
  Query,
  ViewControllerFactory,
} from 'rx-effects';

type AnyObject = Record<string, any>;

export function useInjectableController<Result extends Record<string, unknown>>(
  factory: ControllerFactory<Result>,
): Controller<Result> {
  const container = useDependencyContainer('strict');
  const controller = useMemo(() => factory(container), [container, factory]);

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

export function useViewController<
  Result extends Record<string, unknown>,
  Params extends unknown[],
  QueryParams extends {
    [K in keyof Params]: Params[K] extends infer V ? Query<V> : never;
  },
>(
  factory: ViewControllerFactory<Result, QueryParams>,
  ...params: Params
): Controller<Result> {
  const container = useDependencyContainer('strict');

  const stores = useMemo(
    () =>
      params.length === 0
        ? []
        : new Array(params.length)
            .fill(undefined)
            .map((_, index) => createStore(params[index])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.length],
  );

  useEffect(() => {
    params.forEach((value, index) => stores[index].set(value));
  }, [params, stores]);

  const controller = useMemo(
    () => factory(container, ...(stores as unknown as QueryParams)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [container, factory, ...stores],
  );

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

export function createControllerContainer<T extends AnyObject>(
  token: Token<T>,
  factory: ControllerFactory<T>,
): FC {
  const module = declareModule({ factory, token });

  return ({ children }) => (
    <DependencyModule module={module}>{children}</DependencyModule>
  );
}
