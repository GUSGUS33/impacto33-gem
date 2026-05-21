import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Factory function — evita singleton compartido entre requests en SSR
function createApolloClient() {
  const GRAPHQL_URL =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || 'https://creativu.es/graphql'
      : '/api/graphql';

  return new ApolloClient({
    link: new HttpLink({ uri: GRAPHQL_URL }),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined',
  });
}

// Singleton solo en el cliente — en servidor siempre instancia nueva
let clientInstance: ApolloClient<any> | null = null;

export function getApolloClient(): ApolloClient<any> {
  if (typeof window === 'undefined') {
    // Servidor: nueva instancia por request, sin estado compartido
    return createApolloClient();
  }
  // Cliente: singleton para mantener caché entre navegaciones
  if (!clientInstance) {
    clientInstance = createApolloClient();
  }
  return clientInstance;
}

// Export para compatibilidad con imports existentes
export const client = getApolloClient();
