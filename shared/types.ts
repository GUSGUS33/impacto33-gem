export interface SeoCategoryData {
  url: string;
  slug: string;
  parent_slug: string;
  search_intent: string;
  siblings_intents: string[];
  
  // Bloques de contenido
  hero_tituloPrincipal: string; // H1
  hero_intro: string;
  hub_subcategorias_texto: string;

  // Nuevos campos opcionales
  subcategories?: {
    title: string;
    url: string;
    description: string;
  }[];

  featured_review?: {
    text: string;
    author: string;
    company: string;
    rating: number;
    date: string;
  };

  filters_seo?: {
    [key: string]: string[];
  };
  
  ventajasEmpresa: {
    titulo: string;
    items: string[];
  };
  
  casosUso: {
    titulo: string;
    descripcion: string;
    image_alt: string;
  }[];
  
  faq: {
    pregunta: string;
    respuesta: string;
  }[];
  
  texto_final_refuerzo: string;
  cta_textoCta: string;
  
  // Metadatos SEO
  meta_title: string;
  meta_description: string;
}

export interface SeoDataMap {
  [slug: string]: SeoCategoryData;
}

export interface ProductImage {
  sourceUrl: string;
  altText: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
}

export interface ProductVariationAttribute {
  name: string;
  value: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  price: string;
  stockStatus: string;
  stockQuantity: number | null;
  attributes: {
    nodes: ProductVariationAttribute[];
  };
  image: ProductImage;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  stockStatus: string;
  stockQuantity: number | null;
  shortDescription: string;
  description: string;
  featuredImage: {
    node: ProductImage;
  };
  galleryImages: {
    nodes: ProductImage[];
  };
  productCategories: {
    nodes: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
  attributes: {
    nodes: ProductAttribute[];
  };
  variations: {
    nodes: ProductVariation[];
  };
  related: {
    nodes: Product[];
  };
}
