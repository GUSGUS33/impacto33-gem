import { useState, useCallback } from 'react';
import { calculateScaledPrice } from '../services/pricingService';

interface DemoScenario {
  name: string;
  regularPrice: number;
  quantity: number;
  zones: string[];
  description: string;
}

export const usePricingDemo = () => {
  const [currentScenario, setCurrentScenario] = useState(0);

  // Datos de demostración
  const demoProduct = {
    name: "Camiseta ATOMIC-150",
    regularPrice: 7.00,
    categoryId: "camisetas"
  };

  const demoQuantities = {
    'XS': 0, 'S': 5, 'M': 10, 'L': 8, 'XL': 4, 'XXL': 2
  };

  // Escenarios de prueba
  const scenarios: DemoScenario[] = [
    {
      name: "Cantidad Mínima",
      regularPrice: 7.00,
      quantity: 10,
      zones: ["frontal"],
      description: "Mínima cantidad con una zona de personalización"
    },
    {
      name: "Escalado Medio",
      regularPrice: 7.00,
      quantity: 250,
      zones: ["frontal", "espalda"],
      description: "Escalado medio con dos zonas"
    },
    {
      name: "Escalado Alto",
      regularPrice: 7.00,
      quantity: 1000,
      zones: ["frontal", "espalda", "manga_izquierda", "manga_derecha"],
      description: "Máximo escalado con todas las zonas"
    },
    {
      name: "Cantidad Insuficiente",
      regularPrice: 7.00,
      quantity: 5,
      zones: ["frontal"],
      description: "Por debajo del mínimo para validar alertas"
    }
  ];

  // Datos de pricing de demo (hardcoded para asegurar consistencia en demo)
  const demoPricingData = {
    categoria: "camisetas",
    cantidad_minima: 10,
    factores_escalado: {
      "10": 5.16, "25": 3.69, "50": 2.97, "100": 2.44, 
      "250": 2.26, "500": 2.06, "1000": 1.83
    },
    coste_personalizacion: {
      "frontal": 0.80, "espalda": 0.80, 
      "manga_izquierda": 0.50, "manga_derecha": 0.50
    },
    zonas_permitidas: ["frontal", "espalda", "manga_izquierda", "manga_derecha"]
  };

  // Calcular escenario actual
  const currentCalculation = calculateScaledPrice(
    scenarios[currentScenario].regularPrice,
    scenarios[currentScenario].quantity,
    scenarios[currentScenario].zones,
    demoPricingData
  );

  // Funciones de navegación
  const nextScenario = useCallback(() => {
    setCurrentScenario(prev => (prev + 1) % scenarios.length);
  }, [scenarios.length]);

  const prevScenario = useCallback(() => {
    setCurrentScenario(prev => prev === 0 ? scenarios.length - 1 : prev - 1);
  }, [scenarios.length]);

  const goToScenario = useCallback((index: number) => {
    setCurrentScenario(Math.max(0, Math.min(index, scenarios.length - 1)));
  }, [scenarios.length]);

  return {
    demoProduct,
    demoQuantities,
    scenarios,
    currentScenario,
    currentCalculation,
    nextScenario,
    prevScenario,
    goToScenario,
    isFirstScenario: currentScenario === 0,
    isLastScenario: currentScenario === scenarios.length - 1
  };
};
