import theme from '@nuxt/content-theme-docs'

export default theme({
  docs: {
    primaryColor: '#426dbe',
  },
  loading: { color: '#00CD81' },
  i18n: {
    locales: () => [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en-US.js',
        name: 'English',
      },
    ],
    defaultLocale: 'en',
  },
})
