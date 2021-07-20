import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';
import { OutputOptions, Plugin, RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import babel from '@rollup/plugin-babel';
// @ts-ignore
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';

const VUE_DEMI_IIFE = readFileSync(require.resolve('vue-demi/lib/index.iife.js'), 'utf-8');
const configs: RollupOptions[] = [];

const injectVueDemi: Plugin = {
  name: 'inject-vue-demi',
  renderChunk(code) {
    return `${VUE_DEMI_IIFE};\n;${code}`;
  }
};

const activePackages = [
  {
    display: 'Revue-Draggable',
    external: ['@vueuse/core', '@vueuse/shared']
  }
];

// @ts-ignore
for (const { external, iife } of activePackages) {
  const iifeGlobals = {
    'vue-demi': 'VueDemi',
    '@vueuse/shared': 'VueUse',
    '@vueuse/core': 'VueUse'
  };

  const iifeName = 'RevueDraggable';
  const functionNames = ['revue-draggable'];

  for (const fn of functionNames) {
    const input = 'src/index.ts';

    const output: OutputOptions[] = [
      {
        file: `dist/${fn}.cjs.js`,
        format: 'cjs'
      },
      {
        file: `dist/${fn}.esm.js`,
        format: 'es'
      }
    ];

    if (iife !== false) {
      console.log('iife');
      output.push(
        {
          file: `dist/${fn}.iife.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
          plugins: [injectVueDemi]
        },
        {
          file: `dist/${fn}.iife.min.js`,
          format: 'iife',
          name: iifeName,
          extend: true,
          globals: iifeGlobals,
          plugins: [
            injectVueDemi,
            terser({
              format: {
                comments: false
              }
            })
          ]
        }
      );
    }

    configs.push({
      input,
      output,
      plugins: [
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              declaration: false
            }
          }
        }),
        vue(),
        resolve(),
        commonjs({ include: 'node_modules/**' }),
        babel({
          extensions: [...DEFAULT_BABEL_EXTENSIONS, '.ts', '.tsx'],
          exclude: 'node_modules/**',
          babelHelpers: 'inline'
        })
      ],
      external: ['vue-demi', '@vueuse/shared', ...(external || [])]
    });

    configs.push({
      input,
      output: {
        file: `dist/${fn}.d.ts`,
        format: 'es'
      },
      plugins: [dts()],
      external: ['vue-demi', '@vueuse/shared', ...(external || [])]
    });
  }
}

export default configs;
