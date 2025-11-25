import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // UMD build
  {
    input: 'src/sync-client.ts',
    output: {
      file: 'dist/sync-client.js',
      format: 'umd',
      name: 'CodeServerSync',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist'
      })
    ]
  },
  // ES Module build
  {
    input: 'src/sync-client.ts',
    output: {
      file: 'dist/sync-client.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
];