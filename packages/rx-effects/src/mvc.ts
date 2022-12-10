import { Container, injectable, Token } from 'ditox';
import { Controller } from './controller';
import { createScope, Scope } from './scope';

export function createController<T>(
  factory: (scope: Scope) => T & { destroy?: () => void },
): Controller<T> {
  const scope = createScope();

  const controller = factory(scope);

  return {
    ...controller,

    destroy: () => {
      controller?.destroy?.();
      scope.destroy();
    },
  };
}

export type ControllerFactory<Result> = (
  container: Container,
) => Controller<Result>;

export type InferredService<Factory> = Factory extends ControllerFactory<
  infer Service
>
  ? Service
  : never;

declare type ValuesProps = {
  [key: string]: unknown;
};
declare type TokenProps<Props extends ValuesProps> = {
  [K in keyof Props]: Token<Props[K]>;
};

export function createInjectableController<Props extends ValuesProps, Result>(
  tokens: TokenProps<Props>,
  factory: (scope: Scope, props: Props) => Result,
): ControllerFactory<Result> {
  return injectable(
    (props) => createController((scope) => factory(scope, props as Props)),
    tokens,
  );
}

export const createViewController = createInjectableController;

export function declareControllerFactory<Result, Args extends unknown[]>(
  factory: (...args: Args) => ControllerFactory<Result>,
): (...args: Args) => ControllerFactory<Result> {
  return factory;
}
