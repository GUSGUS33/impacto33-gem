import { wpGraphqlFetch } from '@/lib/wpGraphql'
import { QUERY_GET_HOME_PAGE } from '@/lib/queries/home'
import { HomeBlocks } from '@/components/home/HomeBlocks'
import { generateOrganizationSchema, generateSeoMetadata, generateWebSiteSchema } from '@/lib/seo'
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
  const websiteSchema = generateWebSiteSchema()

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      
      <main className="min-h-screen bg-white">
        <HomeBlocks blocks={blocks} />
      </main>
    </>
  )
}
