import { Bench } from 'tinybench';
import { compute, createStore } from '../src/index';
import {
  ASYNC_EFFECT_SCHEDULER,
  computed,
  effect,
  signal,
} from '../src/signals';

const ITERATION_COUNT = 100;

const bench = new Bench();

bench.add('lagacy compute', () => {
  const entry = createStore(0);

  const a = compute((get) => get(entry));
  const b = compute((get) => get(a) + 1);
  const c = compute((get) => get(a) + 1);
  const d = compute((get) => get(b) + get(c));
  const e = compute((get) => get(d) + 1);
  const f = compute((get) => get(d) + get(e));
  const g = compute((get) => get(d) + get(e));
  const h = compute((get) => get(f) + get(g));

  h.value$.subscribe();

  for (let i = 0; i < ITERATION_COUNT; i++) {
    entry.set(i);
    entry.notify();
  }
});

bench.add('signal computed', () => {
  const entry = signal(0);

  const a = computed(() => entry());
  const b = computed(() => a() + 1);
  const c = computed(() => a() + 1);
  const d = computed(() => b() + c());
  const e = computed(() => d() + 1);
  const f = computed(() => d() + e());
  const g = computed(() => d() + e());
  const h = computed(() => f() + g());

  effect(() => h());

  for (let i = 0; i < ITERATION_COUNT; i++) {
    entry.set(i);
    ASYNC_EFFECT_SCHEDULER.execute();
  }
});

async function main() {
  await bench.run();

  console.table(
    bench.tasks.map(({ name, result }) => {
      return {
        'Task Name': name,
        ...{
          hz: Math.floor(result?.hz ?? 0),
          mean: round(result?.mean),
          variance: round(result?.variance),
          min: round(result?.min),
          max: round(result?.max),
          p75: round(result?.p75),
          p99: round(result?.p99),
          p995: round(result?.p995),
          p999: round(result?.p999),
        },
      };
    }),
  );
}

function round(value: number | undefined): number {
  return value === undefined ? NaN : Math.round(value * 1e6) / 1e3;
}

main();
