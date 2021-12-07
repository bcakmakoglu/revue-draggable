import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'
// @ts-ignore
import { OutputOptions, Plugin, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'

const VUE_DEMI_IIFE = readFileSync(require.resolve('vue-demi/lib/index.iife.js'), 'utf-8')
const configs: RollupOptions[] = []

const injectVueDemi: Plugin = {
  name: 'inject-vue-demi',
  renderChunk(code: string) {
    return `${VUE_DEMI_IIFE};\n;${code}`
  }
}

const activePackages = [
  {
    display: 'Revue-Draggable',
    external: ['@vueuse/core']
  }
]

// @ts-ignore
for (const { external, iife } of activePackages) {
  const iifeGlobals = {
    'vue-demi': 'VueDemi',
    '@vueuse/core': 'VueUse'
  }

  const iifeName = 'RevueDraggable'
  const functionNames = ['revue-draggable']

  for (const fn of functionNames) {
    const input = 'src/index.ts'

    const output: OutputOptions[] = [
      {
        file: `dist/${fn}.cjs.js`,
        format: 'cjs'
      },
      {
        file: `dist/${fn}.esm.js`,
        format: 'es'
      }
    ]

    if (iife !== false) {
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
      )
    }

    configs.push({
      input,
      output,
      plugins: [
        alias({
          entries: [{ find: 'vue', replacement: require.resolve('vue/dist/vue.esm-browser.js') }]
        }),
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              declaration: false
            }
          }
        }),
        resolve(),
        commonjs({ include: 'node_modules/**' })
      ],
      external: ['vue-demi', ...(external || [])]
    })

    configs.push({
      input,
      output: {
        file: `dist/${fn}.d.ts`,
        format: 'es'
      },
      plugins: [dts()],
      external: ['vue-demi', ...(external || [])]
    })
  }
}

export default configs
