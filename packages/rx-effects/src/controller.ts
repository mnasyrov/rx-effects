/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Business logic controller
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
