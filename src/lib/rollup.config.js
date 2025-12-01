const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: '../../dist/src/lib',
    tsConfig: './tsconfig.lib.json',
    assets: [
      { input: '.', output: '.', glob: '*.md' },
      { input: '.', output: '.', glob: 'README.md' },
      { input: './src', output: './src', glob: '**/*.ts' },
      { input: './src', output: './src', glob: '**/*.tsx' },
    ],
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  },
);
