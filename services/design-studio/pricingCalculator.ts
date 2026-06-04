import { DesignProject, PricingEstimate } from '@/types/design-studio';

export function calculateEstimatedPricing(project: DesignProject): PricingEstimate {
  // Base cost based on apparel type
  let baseCost = 0;
  switch (project.apparelConfig.categoryId) {
    case 'oversized-tee':
      baseCost = 599;
      break;
    case 'classic-hoodie':
      baseCost = 1299;
      break;
    case 'crewneck-sweatshirt':
      baseCost = 1099;
      break;
    default:
      baseCost = 500;
  }

  // Print area costs (mock logic: flat fee if any layers exist on a view)
  const printingCostFront = project.designs.front.length > 0 ? 150 : 0;
  const printingCostBack = project.designs.back.length > 0 ? 150 : 0;
  const printingCostSleeve = project.designs.sleeve && project.designs.sleeve.length > 0 ? 100 : 0;

  // Artwork handling fee if any image layers exist
  const hasImages = [...project.designs.front, ...project.designs.back].some(layer => layer.type === 'image');
  const artworkHandlingFee = hasImages ? 50 : 0;

  // Complex color surcharge (mock logic: if more than 5 layers across all views)
  const totalLayers = project.designs.front.length + project.designs.back.length;
  const colorPrintSurcharge = totalLayers > 5 ? 100 : 0;

  // Subtotal before discounts
  const subtotalPerItem = baseCost + printingCostFront + printingCostBack + printingCostSleeve + colorPrintSurcharge + artworkHandlingFee;
  const totalBeforeDiscount = subtotalPerItem * project.apparelConfig.quantity;

  // Quantity Discount
  let discountPercentage = 0;
  if (project.apparelConfig.quantity >= 50) discountPercentage = 0.15;
  else if (project.apparelConfig.quantity >= 10) discountPercentage = 0.05;
  
  const quantityDiscountAmount = totalBeforeDiscount * discountPercentage;
  const discountedTotal = totalBeforeDiscount - quantityDiscountAmount;

  // GST (18% for apparel/services typically, but mock it as 18%)
  const gstAmount = discountedTotal * 0.18;

  const totalEstimate = discountedTotal + gstAmount;

  return {
    baseCost,
    printingCostFront,
    printingCostBack,
    printingCostSleeve,
    colorPrintSurcharge,
    artworkHandlingFee,
    quantityDiscountAmount,
    gstAmount,
    totalEstimate,
  };
}
