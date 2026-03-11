import { generateStaticParamsForCustomDocs, Metadata } from 'nextra/app'
import { props } from 'nextra/app'

// Nextra v3/v4 App Router integration for custom content directory
export const generateStaticParams = generateStaticParamsForCustomDocs

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params
  // Optional: customize metadata based on page content
  return {
    title: `MDS Docs - ${params.mdxPath?.join('/') || 'Home'}`
  }
}

export default async function Page(props: any) {
  const { MDXContent } = await props
  return <MDXContent />
}
