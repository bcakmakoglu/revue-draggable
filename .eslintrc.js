const baseRules = {
  '@typescript-eslint/no-explicit-any': 0,
  '@typescript-eslint/ban-ts-ignore': 0,
  '@typescript-eslint/ban-ts-comment': 0,
  '@typescript-eslint/no-empty-function': 0,
  'no-use-before-define': 0,
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['warn'],
  indent: ['warn', 2, { SwitchCase: 1, flatTernaryExpressions: true }],
  quotes: ['error', 'single', { avoidEscape: true }],
  semi: 0,
  'import/no-mutable-exports': 0,
  'no-cond-assign': [2],
  'no-console': 'off',
  camelcase: 0,
  '@typescript/camelcase': 0,
  'vue/no-v-html': 'off',
  'vue/attribute-hyphenation': 0,
  'prettier/prettier': ['error', {}, { usePrettierrc: true }]
}

module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es6: true,
    browser: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
    'plugin:cypress/recommended'
  ],
  plugins: [],
  rules: baseRules
}
