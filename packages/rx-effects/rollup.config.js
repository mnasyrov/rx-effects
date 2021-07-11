import typescript from '@wessberg/rollup-plugin-ts';
import flowEntryPlugin from 'rollup-plugin-flow-entry';
import pkg from './package.json';

const flowEntry = flowEntryPlugin({
  mode: 'strict',
  types: 'src/index.js.flow',
});

const EXTERNALS = ['rxjs', 'rxjs/operators'];

const rollupRx = (config) => ({
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
    plugins: [rollupRx, flowEntry, typescript()],
  },
  {
    external: EXTERNALS,
    input: 'src/index.ts',
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: 'lib/index.js', format: 'es', sourcemap: true },
    ],
    plugins: [rollupRx, flowEntry, typescript()],
  },
];
