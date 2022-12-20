import { declareModule, Token } from 'ditox';
import { DependencyModule, useDependencyContainer } from 'ditox-react';
import React, { FC, useEffect, useMemo } from 'react';
import {
  Controller,
  ControllerFactory,
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
>(
  factory: ViewControllerFactory<Result, Params>,
  ...params: Params
): Controller<Result> {
  const container = useDependencyContainer('strict');

  const controller = useMemo(
    () => factory(container, ...params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [container, factory, ...params],
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
