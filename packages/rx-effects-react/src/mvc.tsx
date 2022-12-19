import { declareModule, Token } from 'ditox';
import { DependencyModule, useDependencyContainer } from 'ditox-react';
import React, { FC, useEffect, useMemo } from 'react';
import {
  Controller,
  ControllerFactory,
  createScope,
  Query,
  ViewControllerFactory,
} from 'rx-effects';
import { useConst } from './useConst';

type AnyObject = Record<string, any>;

export function useInjectableController<Result extends Record<string, unknown>>(
  factory: ControllerFactory<Result>,
): Controller<Result> {
  const container = useDependencyContainer('strict');
  const controller = useMemo(() => factory(container), [container, factory]);

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

declare type ParamQueries<Params extends unknown[]> = {
  [K in keyof Params]: Query<Params[K]>;
};

export function useViewController<
  Result extends Record<string, unknown>,
  Params extends unknown[],
  PQueries extends ParamQueries<Params>,
>(
  factory: ViewControllerFactory<Result, PQueries>,
  ...params: Params
): Controller<Result> {
  const container = useDependencyContainer('strict');

  const scope = useConst(() => createScope());
  const paramStores = useConst(() =>
    params.map((value) => scope.createStore(value)),
  );

  useEffect(() => {
    params.forEach((value, index) => paramStores[index].set(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, params);

  const controller = useMemo(() => {
    const paramQueries = paramStores.map((store) => store.asQuery());

    return factory(container, ...(paramQueries as any as PQueries));
  }, [container, factory, paramStores]);

  useEffect(() => () => controller.destroy(), [controller]);
  useEffect(() => () => scope.destroy(), [scope]);

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
