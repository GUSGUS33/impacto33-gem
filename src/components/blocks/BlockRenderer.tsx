import { PageBlock } from '@/queries/seoPageComplete';

// Importar componentes de bloques
import { VideoBlock } from './VideoBlock';
import { IconosBlock } from './IconosBlock';
import { GaleriaBlock } from './GaleriaBlock';
import { HtmlBlock } from './HtmlBlock';
import { ProductosVendidosBlock } from './ProductosVendidosBlock';
import { ProductosDestacadosBlock } from './ProductosDestacadosBlock';
import { ProductosDinamicosBlock } from './ProductosDinamicosBlock';
import { SubcategoriasBlock } from './SubcategoriasBlock';
import { FaqBlock } from './FaqBlock';
import { CasosUsoBlock } from './CasosUsoBlock';
import { UsosComunesBlock } from './UsosComunesBlock';
import { InterlinkingBlock } from './InterlinkingBlock';
import { BlogSliderBlock } from './BlogSliderBlock';
import { CtaSecundarioBlock } from './CtaSecundarioBlock';
import { TestimoniosBlock } from './TestimoniosBlock';
import { TrustBadgesBlock } from './TrustBadgesBlock';
import { StatsBlock } from './StatsBlock';
import { ComparativaBlock } from './ComparativaBlock';
import { ProcesoBlock } from './ProcesoBlock';
import { UrgenciaBlock } from './UrgenciaBlock';
import { BeneficiosBlock } from './BeneficiosBlock';
import { VentajasBlock } from './VentajasBlock';
import { GarantiaBlock } from './GarantiaBlock';
import { SocialProofBlock } from './SocialProofBlock';
import { HubsBlock } from './HubsBlock';

/**
 * Mapeo de blockType a componentes React
 */
const BLOCK_COMPONENTS: Record<string, React.ComponentType<{ data: PageBlock }>> = {
  video: VideoBlock,
  iconos: IconosBlock,
  galeria: GaleriaBlock,
  html: HtmlBlock as any,
  textohtml: HtmlBlock as any,
  texto_html: HtmlBlock as any,
  "texto-html": HtmlBlock as any,
  productos_vendidos: ProductosVendidosBlock,
  productosvendidos: ProductosVendidosBlock, // Variante sin guiones
  productos_destacados: ProductosDestacadosBlock,
  productosdestacados: ProductosDestacadosBlock, // Variante sin guiones
  productos_dinamicos: ProductosDinamicosBlock,
  productosdinamicos: ProductosDinamicosBlock, // Variante sin guiones
  subcategorias: SubcategoriasBlock,
  faq: FaqBlock,
  casosuso: CasosUsoBlock,
  usoscomunes: UsosComunesBlock,
  interlinking: InterlinkingBlock,
  blogslider: BlogSliderBlock,
  ctasecundario: CtaSecundarioBlock,
  testimonios: TestimoniosBlock,
  trustbadges: TrustBadgesBlock,
  stats: StatsBlock,
  comparativa: ComparativaBlock,
  proceso: ProcesoBlock,
  urgencia: UrgenciaBlock,
  beneficios: BeneficiosBlock,
  ventajas: VentajasBlock,
  garantia: GarantiaBlock,
  socialproof: SocialProofBlock,
  hubs: HubsBlock,
  hub: HubsBlock,
  hub_cards: HubsBlock,
  hubcards: HubsBlock,
  hub_de_cards: HubsBlock,
  hubdecards: HubsBlock,
};

/**
 * Colores de fondo alternados
 * Se van rotando: blanco → gris suave → azul suave → blanco...
 */
const BACKGROUND_COLORS = [
  'bg-white',
  'bg-slate-50',
  'bg-blue-50',
];

interface BlockRendererProps {
  block: PageBlock;
  index: number;
  pageUri?: string; // URI de la página actual
  pageTitle?: string; // Título de la página actual
  parentUri?: string | null; // URI del padre (si es página hija)
}

/**
 * Componente que renderiza un bloque según su tipo
 * Aplica fondos alternados y espaciado
 */
export function BlockRenderer({ block, index, pageUri, pageTitle, parentUri }: BlockRendererProps) {
  // Ocultar SubcategoriasBlock porque ahora está fusionado en el hero
  // Los datos vienen de WordPress pero se renderizan solo en TransactionalPage
  // blockType es un array, comparar con el primer elemento
  const blockTypeValue = Array.isArray(block.blockType) ? block.blockType[0] : block.blockType;
  
  if (blockTypeValue === 'subcategorias') {
    return null;
  }

  let BlockComponent = BLOCK_COMPONENTS[blockTypeValue];

  // Si no se encuentra por nombre exacto, verificar si es un bloque Hub
  if (!BlockComponent && (
    (typeof blockTypeValue === 'string' && blockTypeValue.toLowerCase().includes('hub')) ||
    (block.hubItems && block.hubItems.length > 0)
  )) {
    BlockComponent = HubsBlock;
  }

  // Si no existe el componente, no renderizar nada
  if (!BlockComponent) {
    if (blockTypeValue === 'textohtml') {
      const bgColor = BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];
      return (
        <section className={`${bgColor} py-16 md:py-24`}>
          <div className="container mx-auto px-4">
            <div dangerouslySetInnerHTML={{ __html: block.htmlContenido || '' }} />
          </div>
        </section>
      );
    }
    console.warn(`Bloque desconocido: ${blockTypeValue}`);
    return null;
  }

  // Seleccionar color de fondo alternado
  const bgColor = BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];

  // Pasar props adicionales a ProductosDinamicosBlock
  const blockProps: any = { data: block };
  if (blockTypeValue === 'productos_dinamicos' || blockTypeValue === 'productosdinamicos') {
    blockProps.pageUri = pageUri;
    blockProps.pageTitle = pageTitle;
    blockProps.parentUri = parentUri;
  }

  return (
    <section className={`${bgColor} py-16 md:py-24`}>
      <div className="container mx-auto px-4">
        <BlockComponent {...blockProps} />
      </div>
    </section>
  );
}
