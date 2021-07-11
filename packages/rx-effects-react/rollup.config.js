import typescript from '@wessberg/rollup-plugin-ts';
import pkg from './package.json';

const EXTERNALS = ['rx-effects', 'react', 'rxjs', 'rxjs/operators'];

const rollupRx = () => ({
  resolveId(id) {
    if (id.startsWith('rxjs/')) {
      return import.meta.resolve(`rxjs/dist/esm/${id.replace('rxjs/', '')}`);
    }
  },
});

export default [
  {
    external: EXTERNALS,
    input: 'src/index.ts',
    output: [{ file: pkg.main, format: 'cjs', sourcemap: true }],
    plugins: [rollupRx, typescript()],
  },
  {
    external: EXTERNALS,
    input: 'src/index.ts',
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
    plugins: [rollupRx, typescript()],
  },
];
