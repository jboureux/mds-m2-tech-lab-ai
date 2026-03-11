import { Footer, Layout, Navbar, ThemeSwitch } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'MDS Strategy & Docs',
  description: 'Documentation for My Digital Scoop project and Agentic Coding strategy',
}

const navbar = (
  <Navbar
    logo={<b>MDS Docs</b>}
    projectLink="https://github.com/jboureux/mds-m2-tech-lab-ai"
  >
    <ThemeSwitch />
  </Navbar>
)
const footer = <Footer>My Digital Scoop © {new Date().getFullYear()}</Footer>

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/jboureux/mds-m2-tech-lab-ai/tree/master/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
