import { Container, injectable, Token } from 'ditox';
import { Controller } from './controller';
import { createScope, Scope } from './scope';
import { AnyObject } from './utils';

export function createController<Service extends AnyObject>(
  factory: (scope: Scope) => Service & { destroy?: () => void },
): Controller<Service> {
  const scope = createScope();

  const controller = factory(scope);

  return {
    ...controller,

    destroy: () => {
      controller.destroy?.();
      scope.destroy();
    },
  };
}

export type ControllerFactory<Service extends AnyObject> = (
  container: Container,
) => Controller<Service>;

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

export function createInjectableController<
  Props extends ValuesProps,
  Service extends AnyObject,
>(
  tokens: TokenProps<Props>,
  factory: (scope: Scope, props: Props) => Service,
): ControllerFactory<Service> {
  return injectable(
    (props) => createController((scope) => factory(scope, props as Props)),
    tokens,
  );
}

export const createViewController = createInjectableController;

export function declareControllerFactory<
  Service extends AnyObject,
  Args extends unknown[],
>(
  factory: (...args: Args) => ControllerFactory<Service>,
): (...args: Args) => ControllerFactory<Service> {
  return factory;
}
