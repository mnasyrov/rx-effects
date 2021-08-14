/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Effects and business logic controller.
 *
 * Implementation of the controller must provide `destroy()` method. It should
 * be used for closing subscriptions and disposing resources.
 *
 * @example
 * ```ts
 * type LoggerController = Controller<{
 *   log: (message: string) => void;
 * }>;
 * ```
 */
export type Controller<ControllerProps extends {} = {}> = Readonly<
  {
    /** Dispose the controller and clean its resources */
    destroy: () => void;
  } & ControllerProps
>;
