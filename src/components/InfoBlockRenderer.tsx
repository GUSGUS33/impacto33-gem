import React from "react";

// Importaremos los subcomponentes de la carpeta infoBlocks
// (Estos se crearán en la Fase 3, por ahora los declaramos como placeholders si es necesario, 
// o simplemente los importamos asumiendo que existirán).
import { HeroInformacionalBlock } from "./infoBlocks/HeroInformacionalBlock";
import { TextoSimpleBlock } from "./infoBlocks/TextoSimpleBlock";
import { TextoConImagenBlock } from "./infoBlocks/TextoConImagenBlock";
import { GaleriaImagenesBlock } from "./infoBlocks/GaleriaImagenesBlock";
import { LogosGridBlock } from "./infoBlocks/LogosGridBlock";
import { AcordeonBlock } from "./infoBlocks/AcordeonBlock";
import { EstadisticasBlock } from "./infoBlocks/EstadisticasBlock";
import { CtaContactoBlock } from "./infoBlocks/CtaContactoBlock";
import { TimelineBlock } from "./infoBlocks/TimelineBlock";
import { EquipoBlock } from "./infoBlocks/EquipoBlock";
import { ProcesoBlock } from "./infoBlocks/ProcesoBlock";
import { InfoVideoBlock } from "./infoBlocks/InfoVideoBlock";
import { HtmlLibreBlock } from "./infoBlocks/HtmlLibreBlock";

interface InfoBlockRendererProps {
  block: any;
}

export function InfoBlockRenderer({ block }: InfoBlockRendererProps) {
  if (!block || !block.__typename) {
    return null;
  }

  // Renderiza el componente correspondiente según el __typename devuelto por GraphQL
  switch (block.__typename) {
    case "BloquesInformacionalesInfoBlocksHeroInformacionalLayout":
      return <HeroInformacionalBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksTextoSimpleLayout":
      return <TextoSimpleBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksTextoConImagenLayout":
      return <TextoConImagenBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksGaleriaImagenesLayout":
      return <GaleriaImagenesBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksLogosGridLayout":
      return <LogosGridBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksAcordeonLayout":
      return <AcordeonBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksEstadisticasLayout":
      return <EstadisticasBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksCtaContactoLayout":
      return <CtaContactoBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksTimelineLayout":
      return <TimelineBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksEquipoLayout":
      return <EquipoBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksProcesoLayout":
      return <ProcesoBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksVideoLayout":
      return <InfoVideoBlock data={block} />;
    case "BloquesInformacionalesInfoBlocksHtmlLibreLayout":
      return <HtmlLibreBlock data={block} />;
    default:
      console.warn(`InfoBlockRenderer: Typename no soportado - ${block.__typename}`);
      return null;
  }
}
