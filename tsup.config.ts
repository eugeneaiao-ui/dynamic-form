import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', core: 'src/core/index.ts', antd: 'src/antd/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2019',
  splitting: true,
  treeshake: true,
  external: ['react', 'react-dom', 'antd', 'dayjs'],
  esbuildOptions(options) {
    // Classic JSX also resolves under native Node ESM with React 16.14.
    options.jsx = 'transform';
    options.jsxFactory = 'React.createElement';
    options.jsxFragment = 'React.Fragment';
  },
});
