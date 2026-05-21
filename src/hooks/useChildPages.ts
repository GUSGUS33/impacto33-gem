import { useQuery } from "@apollo/client";
import { GET_CHILD_PAGES_BY_PARENT_URI } from "../queries/childPages";

export interface ChildPage {
  id: string;
  databaseId: number;
  title: string;
  uri: string;
  slug: string;
  featuredImage?: {
    node: {
      id: string;
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  template?: {
    templateName: string;
    __typename: string;
  };
}

interface UseChildPagesResult {
  childPages: ChildPage[];
  loading: boolean;
  error: any;
}

/**
 * Hook para obtener páginas hijas de WordPress por URI del padre
 * 
 * Resiliente al SSR: si Apollo no está disponible (SSR sin ApolloProvider),
 * devuelve valores por defecto sin lanzar error.
 * 
 * @param parentUri - URI del padre (ej: "camisetas-personalizadas")
 * @returns Páginas hijas, loading, error
 */
export function useChildPages(parentUri: string | undefined): UseChildPagesResult {
  const { data, loading, error } = useQuery(GET_CHILD_PAGES_BY_PARENT_URI, {
    variables: { parentUri },
    skip: !parentUri,
  });

  const childPages: ChildPage[] = data?.page?.children?.nodes || [];

  return {
    childPages,
    loading,
    error,
  };
}
