import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  // Nextra v3/v4 App Router configuration
  // The content will be in apps/docs/content and served via app/[[...mdxPath]]/page.tsx
})

export default withNextra({
  reactStrictMode: true,
})
