import { StateMutation } from './stateMutation';
import { Store } from './store';

const MUTATION_NAME_SYMBOL = Symbol();
const INTERNAL_STORE_SYMBOL = Symbol();

export type StateMutationMetadata = Readonly<{
  name?: string;
}>;

export function getStateMutationMetadata(
  mutation: StateMutation<unknown>,
): StateMutationMetadata {
  const name = (mutation as any)[MUTATION_NAME_SYMBOL];

  return { name };
}

/** @internal */
export function setStateMutationName<State>(
  mutation: StateMutation<State>,
  name: string,
): void {
  (mutation as any)[MUTATION_NAME_SYMBOL] = name;
}

export function isInternalStore(store: Store<any>): boolean {
  return (store as any)[INTERNAL_STORE_SYMBOL] === true;
}

export function setInternalStoreFlag(store: Store<any>): void {
  (store as any)[INTERNAL_STORE_SYMBOL] = true;
}
