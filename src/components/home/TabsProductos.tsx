import { TabsProductosUI } from './TabsProductosUI';
import { TabProductos } from './TabProductos';

export function TabsProductos({ data }: { data: any }) {
  const { titulo, tabs } = data;

  if (!tabs || tabs.length === 0) return null;

  return (
    <TabsProductosUI titulo={titulo} tabs={tabs}>
      {tabs.map((tab: any, index: number) => (
        <TabProductos
          key={index}
          slugCategoria={tab.slugCategoria}
          cantidad={tab.cantidad}
        />
      ))}
    </TabsProductosUI>
  );
}
