import { StateMutation } from './stateMutation';

const MUTATION_NAME_SYMBOL = Symbol();

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
