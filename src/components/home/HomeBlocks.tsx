import dynamic from 'next/dynamic';
import { HomeBlock } from '@/lib/queries/home';
import { HeroSlider } from './HeroSlider';
import { FranjaValor } from './FranjaValor';
import { GridCategorias } from './GridCategorias';

const ProductosDestacados = dynamic(() => import('./ProductosDestacados').then(mod => mod.ProductosDestacados));
const BannerTextoImagen = dynamic(() => import('./BannerTextoImagen').then(mod => mod.BannerTextoImagen));
const BannerDoble = dynamic(() => import('./BannerDoble').then(mod => mod.BannerDoble));
const TabsProductos = dynamic(() => import('./TabsProductos').then(mod => mod.TabsProductos));
const Resenas = dynamic(() => import('./Resenas').then(mod => mod.Resenas));
const CtaFinal = dynamic(() => import('./CtaFinal').then(mod => mod.CtaFinal));
const Newsletter = dynamic(() => import('./Newsletter').then(mod => mod.Newsletter));

export function HomeBlocks({ blocks }: { blocks: HomeBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, index) => {
        let Component = null;
        switch (block.__typename) {
          case 'BloquesHomeHomeblocksHeroSliderLayout':
            Component = <HeroSlider data={block} />;
            break;
          case 'BloquesHomeHomeblocksGridCategoriasLayout':
            Component = <GridCategorias data={block} />;
            break;
          case 'BloquesHomeHomeblocksProductosDestacadosLayout':
            Component = <ProductosDestacados data={block} />;
            break;
          case 'BloquesHomeHomeblocksBannerTextoImagenLayout':
            Component = <BannerTextoImagen data={block} />;
            break;
          case 'BloquesHomeHomeblocksBannerDobleLayout':
            Component = <BannerDoble data={block} />;
            break;
          case 'BloquesHomeHomeblocksTabsProductosLayout':
            Component = <TabsProductos data={block} />;
            break;
          case 'BloquesHomeHomeblocksResenasLayout':
            Component = <Resenas data={block} />;
            break;
          case 'BloquesHomeHomeblocksCtaFinalLayout':
            Component = <CtaFinal data={block} />;
            break;
          case 'BloquesHomeHomeblocksNewsletterLayout':
            Component = <Newsletter data={block} />;
            break;
          default:
            return null;
        }

        return (
          <div key={`${block.__typename}-${index}`}>
            {Component}
            {/* Después del primer bloque (que suele ser HeroSlider), insertar FranjaValor */}
            {index === 0 && <FranjaValor />}
          </div>
        );
      })}
    </>
  );
}
