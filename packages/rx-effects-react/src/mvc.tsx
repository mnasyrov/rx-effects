import { declareModule, Token } from 'ditox';
import { DependencyModule, useDependencyContainer } from 'ditox-react';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import {
  Controller,
  ControllerFactory,
  createStore,
  Query,
  ViewControllerFactory,
} from 'rx-effects';
import { Store } from 'rx-effects/src/index';

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

  const storesRef = useRef<Store<any>[]>();

  const controller = useMemo(() => {
    if (!storesRef.current) {
      storesRef.current = createStoresForParams(params);
    }

    return factory(container, ...(storesRef.current as unknown as QueryParams));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, factory]);

  useEffect(() => {
    const stores = storesRef.current;
    if (stores) {
      params.forEach((value, index) => stores[index].set(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, params);

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

function createStoresForParams(params: any[]): Store<any>[] {
  return params.length === 0
    ? []
    : new Array(params.length)
        .fill(undefined)
        .map((_, index) => createStore(params[index]));
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
