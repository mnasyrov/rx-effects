/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { toSignal } from './toSignal';

describe('toSignal()', () => {
  it('should reflect the last emitted value of an Observable', () => {
    const counter$ = new BehaviorSubject(0);
    const counter = toSignal(counter$);

    expect(counter()).toBe(0);
    counter$.next(1);
    expect(counter()).toBe(1);
    counter$.next(3);
    expect(counter()).toBe(3);
  });

  it('should notify when the last emitted value of an Observable changes', () => {
    const counter$ = new BehaviorSubject(1);
    const counter = toSignal(counter$);

    expect(counter()).toBe(1);

    counter$.next(2);
    expect(counter()).toBe(2);
  });

  it('should propagate an error returned by the Observable', () => {
    const counter$ = new BehaviorSubject(1);
    const counter = toSignal(counter$);

    expect(counter()).toBe(1);

    counter$.error('fail');
    expect(counter).toThrow('fail');
  });

  describe('with no initial value', () => {
    it('should return `undefined` if read before a value is emitted', () => {
      const counter$ = new Subject<number>();
      const counter = toSignal(counter$);

      expect(counter()).toBeUndefined();
      counter$.next(1);
      expect(counter()).toBe(1);
    });

    it('should not throw if a value is emitted before called', () => {
      const counter$ = new Subject<number>();
      const counter = toSignal(counter$);

      counter$.next(1);
      expect(() => counter()).not.toThrow();
    });
  });

  describe('with requireSync', () => {
    it('should throw if created before a value is emitted', () => {
      const counter$ = new Subject<number>();
      expect(() => toSignal(counter$, { requireSync: true })).toThrow();
    });

    it('should not throw if a value emits synchronously on creation', () => {
      const counter$ = new ReplaySubject<number>(1);
      counter$.next(1);
      const counter = toSignal(counter$);
      expect(counter()).toBe(1);
    });
  });

  describe('with an initial value', () => {
    it('should return the initial value if called before a value is emitted', () => {
      const counter$ = new Subject<number>();
      const counter = toSignal(counter$, { initialValue: null });

      expect(counter()).toBeNull();
      counter$.next(1);
      expect(counter()).toBe(1);
    });

    it('should not return the initial value if called after a value is emitted', () => {
      const counter$ = new Subject<number>();
      const counter = toSignal(counter$, { initialValue: null });

      counter$.next(1);
      expect(counter()).not.toBeNull();
    });
  });
});
