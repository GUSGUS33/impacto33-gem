import { describe, it, expect } from 'vitest';

/**
 * Tests para verificar el fix de useUserOrders.ts
 * 
 * Fix: El hook importaba useAuth de '@/_core/hooks/useAuth' (Manus OAuth)
 * en lugar de useAuth de '@/context/AuthContext' (Supabase Auth).
 * Esto causaba que los pedidos no se cargaran porque el userId venía vacío.
 */

describe('useUserOrders - Auth import fix', () => {
  it('should import useAuth from Supabase AuthContext, not from Manus OAuth', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const hookPath = path.resolve(__dirname, 'useUserOrders.ts');
    const content = fs.readFileSync(hookPath, 'utf-8');
    
    // Verificar que importa de AuthContext (Supabase)
    expect(content).toContain("from '@/context/AuthContext'");
    
    // Verificar que NO importa de Manus OAuth core
    expect(content).not.toContain("from '@/_core/hooks/useAuth'");
  });

  it('should use user from Supabase auth context', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const hookPath = path.resolve(__dirname, 'useUserOrders.ts');
    const content = fs.readFileSync(hookPath, 'utf-8');
    
    // Verificar que usa user del contexto de Supabase
    expect(content).toContain('const { user }');
    expect(content).toContain('useAuth()');
    
    // Verificar que usa user como guard para cargar pedidos (Supabase user object)
    expect(content).toContain('if (!user)');
  });
});

describe('Next.js provider structure', () => {
  it('should include AuthProvider around application children', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const providersPath = path.resolve(__dirname, '..', '..', 'app', 'providers.tsx');
    const content = fs.readFileSync(providersPath, 'utf-8');
    
    // Verificar que AuthProvider envuelve App
    expect(content).toContain('<AuthProvider>');
    expect(content).toContain('</AuthProvider>');
    expect(content).toContain('{children}');
  });
});
