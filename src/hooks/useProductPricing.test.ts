import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductPricing } from './useProductPricing';
import { Product } from "@shared/types";

// Mock de producto básico
const mockProduct: Product = {
  id: '1',
  name: 'Camiseta Test',
  slug: 'camiseta-test',
  price: '10,00 €',
  stockStatus: 'IN_STOCK',
  variations: {
    nodes: [
      {
        price: '10,00 €',
        stockStatus: 'IN_STOCK',
        stockQuantity: 100,
        attributes: {
          nodes: [
            { name: 'pa_color', value: 'Rojo' },
            { name: 'pa_talla', value: 'M' }
          ]
        }
      }
    ]
  }
};

describe('useProductPricing Hook', () => {
  it('debería inicializarse correctamente', () => {
    const { result } = renderHook(() => useProductPricing({ 
      product: mockProduct, 
      basePrice: 10, 
      pricingCategory: 'camisetas' 
    }));

    expect(result.current.selectedColor).toBe('');
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.hasSelectedColor).toBe(false);
  });

  it('debería permitir seleccionar un color', () => {
    const { result } = renderHook(() => useProductPricing({ 
      product: mockProduct, 
      basePrice: 10, 
      pricingCategory: 'camisetas' 
    }));

    act(() => {
      result.current.selectColor('Rojo');
    });

    expect(result.current.selectedColor).toBe('Rojo');
    expect(result.current.hasSelectedColor).toBe(true);
  });

  it('debería actualizar cantidades', () => {
    const { result } = renderHook(() => useProductPricing({ 
      product: mockProduct, 
      basePrice: 10, 
      pricingCategory: 'camisetas' 
    }));

    act(() => {
      result.current.selectColor('Rojo');
    });



    act(() => {
      result.current.updateQuantity('M', 5);
    });

    expect(result.current.quantities['M']).toBe(5);
    expect(result.current.totalQuantity).toBe(5);
  });

  it('inicializa una opción estándar y talla única para productos simples', async () => {
    const simpleProduct = {
      ...mockProduct,
      __typename: 'SimpleProduct',
      variations: undefined,
      attributes: { nodes: [] },
      stockQuantity: null,
    } as unknown as Product;

    const { result } = renderHook(() => useProductPricing({
      product: simpleProduct,
      basePrice: 10,
      pricingCategory: 'default',
    }));

    await waitFor(() => expect(result.current.selectedColor).toBe('Estándar'));
    expect(result.current.sizeOptions).toEqual([
      expect.objectContaining({ size: 'Única', stockQuantity: 9999 }),
    ]);
    expect(result.current.canEnterQuantities).toBe(true);

    act(() => result.current.updateQuantity('Única', 25));
    expect(result.current.totalQuantity).toBe(25);
  });
});
