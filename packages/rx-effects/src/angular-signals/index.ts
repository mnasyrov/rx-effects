/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { createSignalFromFunction, defaultEquals, isSignal } from './src/api';
export type { Signal, ValueEqualityFn } from './src/api';

export { computed } from './src/computed';
export type { CreateComputedOptions } from './src/computed';

export { setThrowInvalidWriteToSignalError } from './src/errors';
export { ReactiveNode, setActiveConsumer } from './src/graph';

export { setPostSignalSetFn, signal } from './src/signal';
export type { CreateSignalOptions, WritableSignal } from './src/signal';

export { untracked } from './src/untracked';

export { Watch } from './src/watch';
export type { WatchCleanupFn } from './src/watch';
