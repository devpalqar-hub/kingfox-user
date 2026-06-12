export interface DesignProject {
  projectId: string;
  apparelConfig: ApparelConfig;
  designs: {
    front: Layer[];
    back: Layer[];
    sleeve?: Layer[];
    neck?: Layer[];
  };
  future3DConfig?: Future3DConfig;
}

export type LayerType = 'text' | 'image' | 'line';

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  opacity: number; // 0 to 1
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  colorHex: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  asset: UploadedAsset;
}

export interface LineLayer extends BaseLayer {
  type: 'line';
  thickness: number;
  colorHex: string;
}

export type Layer = TextLayer | ImageLayer | LineLayer;

export interface ApparelConfig {
  categoryId: string;
  colorName: string;
  colorHex: string;
  size: string;
  quantity: number;
}

export interface UploadedAsset {
  assetId: string;
  originalUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  dpi?: number;
}

export interface PricingEstimate {
  baseCost: number;
  printingCostFront: number;
  printingCostBack: number;
  printingCostSleeve: number;
  colorPrintSurcharge: number;
  artworkHandlingFee: number;
  quantityDiscountAmount: number;
  gstAmount: number;
  totalEstimate: number;
}

export interface ProductionMetadata {
  canvasWidthPx: number;
  canvasHeightPx: number;
  printAreaPhysicalWidthCm: number;
  printAreaPhysicalHeightCm: number;
  exportVersion: string;
}

export interface Future3DConfig {
  modelUrl: string;
  textureMapping: Record<string, string>;
}

export interface OrderPayload {
  customerDetails: Record<string, any>;
  designProject: DesignProject;
  pricing: PricingEstimate;
  finalPaidAmount: number;
  productionMetadata: ProductionMetadata;
  productionNotes: string;
}
