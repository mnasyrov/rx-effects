/* eslint-disable @typescript-eslint/ban-types */

import { AnyObject } from './utils';

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
export type Controller<ControllerProps extends AnyObject = AnyObject> =
  Readonly<
    ControllerProps & {
      /** Dispose the controller and clean its resources */
      destroy: () => void;
    }
  >;
