import { useEffect, useState } from "react";
import {
  loadProductConfig,
  type ProductConfig,
} from "@/services/productConfigService";

interface RestoredProductConfigState {
  config: ProductConfig | null;
  isReady: boolean;
}

const INITIAL_STATE: RestoredProductConfigState = {
  config: null,
  isReady: false,
};

/**
 * Defers localStorage access until after hydration so the server and the first
 * client render always produce identical markup.
 */
export const useRestoredProductConfig = (
  productSlug: string,
): RestoredProductConfigState => {
  const [state, setState] = useState<RestoredProductConfigState>(INITIAL_STATE);

  useEffect(() => {
    setState({
      config: loadProductConfig(productSlug),
      isReady: true,
    });
  }, [productSlug]);

  return state;
};
