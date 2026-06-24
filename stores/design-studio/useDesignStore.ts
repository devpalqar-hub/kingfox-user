import { create } from 'zustand';
import { DesignProject, Layer, TextLayer, ImageLayer, ApparelConfig, PricingEstimate } from '@/types/design-studio';
import { calculateEstimatedPricing } from '@/services/design-studio/pricingCalculator';
import { CustomDesignVariant } from '@/services/custom-design.service';

type ViewType = 'front' | 'back' | 'sleeve';

interface DesignState {
  project: DesignProject;
  activeView: ViewType;
  selectedLayerId: string | null;
  pricing: PricingEstimate | null;
  availableVariants: CustomDesignVariant[];

  // Actions
  setAvailableVariants: (variants: CustomDesignVariant[]) => void;
  setApparelCategory: (categoryId: string) => void;
  setApparelSize: (size: string) => void;
  setApparelQuantity: (quantity: number) => void;
  changeApparelColor: (hex: string, name: string) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  switchView: (view: ViewType) => void;
  calculatePricing: () => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  clearView: (view: ViewType) => void;
  clearAll: () => void;
}

const initialProject: DesignProject = {
  projectId: 'new-project',
  apparelConfig: {
    categoryId: 'oversized-tee',
    colorName: 'Black',
    colorHex: '#000000',
    size: 'M',
    quantity: 1,
  },
  designs: {
    front: [],
    back: [],
    sleeve: [],
  },
};

export const useDesignStore = create<DesignState>((set, get) => ({
  project: initialProject,
  activeView: 'front',
  selectedLayerId: null,
  pricing: null,
  availableVariants: [],

  setAvailableVariants: (variants) => set({ availableVariants: variants }),

  setApparelCategory: (categoryId) =>
    set((state) => ({
      project: {
        ...state.project,
        apparelConfig: { ...state.project.apparelConfig, categoryId },
      },
    })),

  setApparelSize: (size) =>
    set((state) => {
      const variant = state.availableVariants.find(
        (v) => v.colorCode === state.project.apparelConfig.colorHex && v.size === size
      );
      return {
        project: {
          ...state.project,
          apparelConfig: {
            ...state.project.apparelConfig,
            size,
            customDesignVariantId: variant?.id,
            basePrice: variant?.sellingPrice,
          },
        },
      };
    }),

  setApparelQuantity: (quantity) =>
    set((state) => ({
      project: {
        ...state.project,
        apparelConfig: {
          ...state.project.apparelConfig,
          quantity: Math.max(1, quantity), // Ensure minimum quantity is 1
        },
      },
    })),

  changeApparelColor: (colorHex, colorName) =>
    set((state) => {
      // Find the variant with this color and the current size to update variantId and price
      const variant = state.availableVariants.find(
        (v) => v.colorCode === colorHex && v.size === state.project.apparelConfig.size
      );
      return {
        project: {
          ...state.project,
          apparelConfig: {
            ...state.project.apparelConfig,
            colorHex,
            colorName,
            customDesignVariantId: variant?.id,
            basePrice: variant?.sellingPrice,
          },
        },
      };
    }),

  addLayer: (layer) =>
    set((state) => {
      const view = state.activeView;
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: [...(state.project.designs[view] || []), layer],
          },
        },
        selectedLayerId: layer.id,
      };
    }),

  updateLayer: (id, updates) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer) as Layer),
          },
        },
      };
    }),

  removeLayer: (id) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: layers.filter((layer) => layer.id !== id),
          },
        },
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      };
    }),

  selectLayer: (id) => set({ selectedLayerId: id }),

  switchView: (view) => set({ activeView: view, selectedLayerId: null }),

  calculatePricing: () => {
    const { project } = get();
    const estimate = calculateEstimatedPricing(project);
    set({ pricing: estimate });
  },

  duplicateLayer: (id) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      const layerToDuplicate = layers.find((l) => l.id === id);

      if (!layerToDuplicate) return state;

      const duplicatedLayer = {
        ...layerToDuplicate,
        id: `${layerToDuplicate.type}_${Date.now()}`,
        name: `${layerToDuplicate.name} Copy`,
        x: layerToDuplicate.x + 20,
        y: layerToDuplicate.y + 20,
        zIndex: layers.length + 1,
      };

      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: [...layers, duplicatedLayer],
          },
        },
        selectedLayerId: duplicatedLayer.id,
      };
    }),

  reorderLayer: (id, direction) =>
    set((state) => {
      const view = state.activeView;
      const layers = [...(state.project.designs[view] || [])];
      const index = layers.findIndex((l) => l.id === id);

      if (index === -1) return state;
      if (direction === 'up' && index === layers.length - 1) return state;
      if (direction === 'down' && index === 0) return state;

      const newIndex = direction === 'up' ? index + 1 : index - 1;
      const layer = layers[index];
      layers.splice(index, 1);
      layers.splice(newIndex, 0, layer);

      // Update zIndex for all layers
      const updatedLayers = layers.map((l, i) => ({ ...l, zIndex: i + 1 }));

      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: updatedLayers as Layer[],
          },
        },
      };
    }),

  toggleLayerVisibility: (id) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: layers.map((layer) =>
              layer.id === id ? { ...layer, isVisible: !layer.isVisible } : layer
            ) as Layer[],
          },
        },
      };
    }),

  toggleLayerLock: (id) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: layers.map((layer) =>
              layer.id === id ? { ...layer, isLocked: !layer.isLocked } : layer
            ) as Layer[],
          },
        },
      };
    }),

  renameLayer: (id, name) =>
    set((state) => {
      const view = state.activeView;
      const layers = state.project.designs[view] || [];
      return {
        project: {
          ...state.project,
          designs: {
            ...state.project.designs,
            [view]: layers.map((layer) =>
              layer.id === id ? { ...layer, name } : layer
            ) as Layer[],
          },
        },
      };
    }),

  clearView: (view) =>
    set((state) => ({
      project: {
        ...state.project,
        designs: {
          ...state.project.designs,
          [view]: [],
        },
      },
      selectedLayerId: state.activeView === view ? null : state.selectedLayerId,
    })),

  clearAll: () =>
    set((state) => ({
      project: {
        ...state.project,
        designs: {
          front: [],
          back: [],
          sleeve: [],
          neck: [],
        },
      },
      selectedLayerId: null,
    })),
}));

