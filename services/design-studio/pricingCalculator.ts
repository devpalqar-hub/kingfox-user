import { DesignProject, PricingEstimate } from '@/types/design-studio';

export function calculateEstimatedPricing(project: DesignProject): PricingEstimate {
  // Use the exact selling price from the variant as per requirement
  const baseCost = project.apparelConfig.basePrice || 0;
  
  // No additional print fees for font, image, gst etc.
  const printingCostFront = 0;
  const printingCostBack = 0;
  const printingCostSleeve = 0;
  const colorPrintSurcharge = 0;
  const artworkHandlingFee = 0;
  const quantityDiscountAmount = 0;
  const gstAmount = 0;

  // Subtotal
  const totalEstimate = baseCost * project.apparelConfig.quantity;

  return {
    baseCost: totalEstimate, // Update baseCost to show total for quantity, or keep it per item and calculate total
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
