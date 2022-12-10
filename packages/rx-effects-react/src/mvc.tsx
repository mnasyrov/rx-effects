import { declareModule, Token } from 'ditox';
import { DependencyModule, useDependencyContainer } from 'ditox-react';
import React, { FC, useEffect, useMemo } from 'react';
import { Controller, ControllerFactory } from 'rx-effects';

type AnyObject = Record<string, any>;

export function useInjectableController<Result extends Record<string, unknown>>(
  factory: ControllerFactory<Result>,
): Controller<Result> {
  const container = useDependencyContainer('strict');
  const controller = useMemo(() => factory(container), [container, factory]);

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

export const useViewController = useInjectableController;

export function useControllerFactory<Args extends unknown[], Result>(
  factoryDeclaration: (...args: Args) => ControllerFactory<Controller<Result>>,
  ...args: Args
): Controller<Result> {
  const controllerFactory = useMemo(
    () => factoryDeclaration(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [factoryDeclaration, ...args],
  );

  return useInjectableController<Controller<Result>>(controllerFactory);
}

export function createViewControllerContainer<T extends AnyObject>(
  token: Token<T>,
  factory: ControllerFactory<T>,
): FC {
  const module = declareModule({ factory, token });

  return ({ children }) => (
    <DependencyModule module={module}>{children}</DependencyModule>
  );
}
