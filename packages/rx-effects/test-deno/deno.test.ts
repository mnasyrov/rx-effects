/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

import { assertStrictEquals } from 'https://deno.land/std@0.79.0/testing/asserts.ts';

Deno.test('should bind a value to the container', () => {
  // TODO: Deno tests
  assertStrictEquals(1, 1);
});
