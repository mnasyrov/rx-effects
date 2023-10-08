/**
 * Tracks the currently active effects
 */
let activeEffect: ReactiveNode | undefined = undefined;
let activeEffects: ReactiveNode[] = [];

export function getActiveEffect(): ReactiveNode | undefined {
  return activeEffect;
}

export function getActiveEffects(): ReactiveNode[] {
  return activeEffects;
}

export function setActiveEffect(
  effect: ReactiveNode | undefined,
): ReactiveNode | undefined {
  const prev = activeEffect;
  activeEffect = effect;

  if (effect) {
    activeEffects.push(effect);
  } else {
    activeEffects = [];
  }

  return prev;
}

export abstract class ReactiveNode {
  private readonly ref = new WeakRef<ReactiveNode>(this);

  private readonly consumerEffects = new Map<WeakRef<ReactiveNode>, number>();

  /**
   * Monotonically increasing counter representing a version of this `Consumer`'s
   * dependencies.
   */
  protected effectClock = -1;

  /**
   * Monotonically increasing counter which increases when the value of this `Producer`
   * semantically changes.
   */
  protected valueVersion = -1;

  protected isDestroyed = false;

  destroy(): void {
    this.isDestroyed = true;
  }

  readonly notify?: () => void;

  /**
   * Notify all consumers of this producer that its value may have changed.
   */
  protected producerMayHaveChanged(): void {
    for (const [effectRef, atEffectClock] of this.consumerEffects) {
      const effect = effectRef.deref();

      if (!effect || effect.effectClock !== atEffectClock) {
        // if (!effect) {
        this.consumerEffects.delete(effectRef);
        continue;
      }

      effect?.notify?.();
    }
  }

  /**
   * Mark that this producer node has been accessed in the current reactive context.
   */
  protected producerAccessed(): void {
    const effects = getActiveEffects();
    if (effects.length > 0) {
      effects.forEach((effect) => {
        this.consumerEffects.set(effect.ref, effect.effectClock);
      });
    }
  }
}
