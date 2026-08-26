import { useQuery } from '@apollo/client';
import { GET_FULL_VARIABLE_PRODUCT } from '../lib/queries';
import { Product } from "@shared/types";

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: Error | undefined;
}

export const useProduct = (slug: string): UseProductResult => {
  const { data, loading, error } = useQuery(GET_FULL_VARIABLE_PRODUCT, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-first',
  });

  return {
    product: data?.product as Product || null,
    loading,
    error,
  };
};
