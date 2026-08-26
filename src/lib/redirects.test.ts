import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getVerifiedRedirect } from './redirects';

describe('Sistema de Redirecciones 301 Verificadas', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe devolver redirección explícita para rutas registradas', async () => {
    const res = await getVerifiedRedirect('/inicio');
    expect(res).toBe('/');
  });

  it('NO debe inventar URLs si la ruta no existe y WordPress devuelve 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 404,
      headers: new Headers(),
    } as unknown as Response);

    const res = await getVerifiedRedirect('/producto/inventado-inexistente');
    expect(res).toBeNull();
  });

  it('debe capturar redirección 301 oficial cuando WordPress devuelve nuevo slug real', async () => {
    const headers = new Headers();
    headers.set('location', 'https://creativu.es/producto/camiseta-algodon-premium/');

    global.fetch = vi.fn().mockResolvedValue({
      status: 301,
      headers,
    } as unknown as Response);

    const res = await getVerifiedRedirect('/producto/camiseta-algodon-antigua');
    expect(res).toBe('/producto/camiseta-algodon-premium');
  });

  it('NO debe generar redirección si el destino es el mismo origen (evitar bucle o trailing slash único)', async () => {
    const headers = new Headers();
    headers.set('location', 'https://creativu.es/camisetas-personalizadas/');

    global.fetch = vi.fn().mockResolvedValue({
      status: 301,
      headers,
    } as unknown as Response);

    const res = await getVerifiedRedirect('/camisetas-personalizadas');
    expect(res).toBeNull();
  });

  it('debe devolver null para rutas vacías o inválidas', async () => {
    const res = await getVerifiedRedirect('');
    expect(res).toBeNull();
  });
});
