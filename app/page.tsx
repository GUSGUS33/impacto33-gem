import { wpGraphqlFetch } from '@/lib/wpGraphql'
import { QUERY_GET_HOME_PAGE } from '@/lib/queries/home'
import { HomeBlocks } from '@/components/home/HomeBlocks'
import { generateOrganizationSchema, generateSeoMetadata } from '@/lib/seo'
import Script from 'next/script'
import { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = generateSeoMetadata({
  title: 'Artículos promocionales y regalos de empresa personalizados',
  description: 'Catálogo de artículos promocionales y regalos publicitarios personalizados. Precios de fábrica y calidad garantizada.',
  url: 'https://impacto33.com'
})

export default async function HomePage() {
  const data = await wpGraphqlFetch<{ page: any }>(
    QUERY_GET_HOME_PAGE, {}
  ).catch(() => null)

  const blocks = data?.page?.bloquesHome?.homeblocks ?? []
  
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IMPACTO33",
    "url": "https://impacto33.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://impacto33.com/busqueda?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      <Script id="org-schema" type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <Script id="website-schema" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      
      <main className="min-h-screen bg-white">
        <HomeBlocks blocks={blocks} />
      </main>
    </>
  )
}
