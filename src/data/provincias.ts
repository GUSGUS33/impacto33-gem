export interface Provincia {
  name: string;
  slug: string;
  community: string;
  capital?: string;
}

export const PENINSULAR_PROVINCES: Provincia[] = [
  // Andalucía
  { name: 'Almería', slug: 'almeria', community: 'Andalucía', capital: 'Almería' },
  { name: 'Cádiz', slug: 'cadiz', community: 'Andalucía', capital: 'Cádiz' },
  { name: 'Córdoba', slug: 'cordoba', community: 'Andalucía', capital: 'Córdoba' },
  { name: 'Granada', slug: 'granada', community: 'Andalucía', capital: 'Granada' },
  { name: 'Huelva', slug: 'huelva', community: 'Andalucía', capital: 'Huelva' },
  { name: 'Jaén', slug: 'jaen', community: 'Andalucía', capital: 'Jaén' },
  { name: 'Málaga', slug: 'malaga', community: 'Andalucía', capital: 'Málaga' },
  { name: 'Sevilla', slug: 'sevilla', community: 'Andalucía', capital: 'Sevilla' },

  // Aragón
  { name: 'Huesca', slug: 'huesca', community: 'Aragón', capital: 'Huesca' },
  { name: 'Teruel', slug: 'teruel', community: 'Aragón', capital: 'Teruel' },
  { name: 'Zaragoza', slug: 'zaragoza', community: 'Aragón', capital: 'Zaragoza' },

  // Asturias
  { name: 'Asturias', slug: 'asturias', community: 'Principado de Asturias', capital: 'Oviedo' },

  // Cantabria
  { name: 'Cantabria', slug: 'cantabria', community: 'Cantabria', capital: 'Santander' },

  // Castilla-La Mancha
  { name: 'Albacete', slug: 'albacete', community: 'Castilla-La Mancha', capital: 'Albacete' },
  { name: 'Ciudad Real', slug: 'ciudad-real', community: 'Castilla-La Mancha', capital: 'Ciudad Real' },
  { name: 'Cuenca', slug: 'cuenca', community: 'Castilla-La Mancha', capital: 'Cuenca' },
  { name: 'Guadalajara', slug: 'guadalajara', community: 'Castilla-La Mancha', capital: 'Guadalajara' },
  { name: 'Toledo', slug: 'toledo', community: 'Castilla-La Mancha', capital: 'Toledo' },

  // Castilla y León
  { name: 'Ávila', slug: 'avila', community: 'Castilla y León', capital: 'Ávila' },
  { name: 'Burgos', slug: 'burgos', community: 'Castilla y León', capital: 'Burgos' },
  { name: 'León', slug: 'leon', community: 'Castilla y León', capital: 'León' },
  { name: 'Palencia', slug: 'palencia', community: 'Castilla y León', capital: 'Palencia' },
  { name: 'Salamanca', slug: 'salamanca', community: 'Castilla y León', capital: 'Salamanca' },
  { name: 'Segovia', slug: 'segovia', community: 'Castilla y León', capital: 'Segovia' },
  { name: 'Soria', slug: 'soria', community: 'Castilla y León', capital: 'Soria' },
  { name: 'Valladolid', slug: 'valladolid', community: 'Castilla y León', capital: 'Valladolid' },
  { name: 'Zamora', slug: 'zamora', community: 'Castilla y León', capital: 'Zamora' },

  // Cataluña
  { name: 'Barcelona', slug: 'barcelona', community: 'Cataluña', capital: 'Barcelona' },
  { name: 'Girona', slug: 'girona', community: 'Cataluña', capital: 'Girona' },
  { name: 'Lleida', slug: 'lleida', community: 'Cataluña', capital: 'Lleida' },
  { name: 'Tarragona', slug: 'tarragona', community: 'Cataluña', capital: 'Tarragona' },

  // Comunidad Valenciana
  { name: 'Alicante', slug: 'alicante', community: 'Comunidad Valenciana', capital: 'Alicante' },
  { name: 'Castellón', slug: 'castellon', community: 'Comunidad Valenciana', capital: 'Castellón de la Plana' },
  { name: 'Valencia', slug: 'valencia', community: 'Comunidad Valenciana', capital: 'Valencia' },

  // Extremadura
  { name: 'Badajoz', slug: 'badajoz', community: 'Extremadura', capital: 'Badajoz' },
  { name: 'Cáceres', slug: 'caceres', community: 'Extremadura', capital: 'Cáceres' },

  // Galicia
  { name: 'A Coruña', slug: 'a-coruna', community: 'Galicia', capital: 'A Coruña' },
  { name: 'Lugo', slug: 'lugo', community: 'Galicia', capital: 'Lugo' },
  { name: 'Ourense', slug: 'ourense', community: 'Galicia', capital: 'Ourense' },
  { name: 'Pontevedra', slug: 'pontevedra', community: 'Galicia', capital: 'Pontevedra' },

  // La Rioja
  { name: 'La Rioja', slug: 'la-rioja', community: 'La Rioja', capital: 'Logroño' },

  // Comunidad de Madrid
  { name: 'Madrid', slug: 'madrid', community: 'Comunidad de Madrid', capital: 'Madrid' },

  // Región de Murcia
  { name: 'Murcia', slug: 'murcia', community: 'Región de Murcia', capital: 'Murcia' },

  // Comunidad Foral de Navarra
  { name: 'Navarra', slug: 'navarra', community: 'Comunidad Foral de Navarra', capital: 'Pamplona' },

  // País Vasco
  { name: 'Álava', slug: 'alava', community: 'País Vasco', capital: 'Vitoria-Gasteiz' },
  { name: 'Guipúzcoa', slug: 'guipuzcoa', community: 'País Vasco', capital: 'San Sebastián' },
  { name: 'Vizcaya', slug: 'vizcaya', community: 'País Vasco', capital: 'Bilbao' },
];

export function getProvincesByCommunity(): Record<string, Provincia[]> {
  const grouped: Record<string, Provincia[]> = {};
  for (const prov of PENINSULAR_PROVINCES) {
    if (!grouped[prov.community]) {
      grouped[prov.community] = [];
    }
    grouped[prov.community].push(prov);
  }
  return grouped;
}
