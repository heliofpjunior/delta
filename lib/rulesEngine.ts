/**
 * Delta Platform Rules Engine
 * 
 * Handles all financial logic, margin protection, and XP calculation.
 */

export const FINANCE_CONSTANTS = {
    BASE_COST: 53.00, // R$ 50,00 cert + R$ 3,00 taxa
    TAX_RATE: 0.06,   // 6% Impostos
};

export type SellerLevel = "Bronze" | "Prata" | "Ouro";

export const LEVEL_COSTS: Record<SellerLevel, { PF: number; PJ: number }> = {
    Bronze: { PF: 85.00, PJ: 95.00 },
    Prata: { PF: 78.00, PJ: 87.00 },
    Ouro: { PF: 70.00, PJ: 79.00 },
};

export interface CalculationStep {
    label: string;
    value: number;
    type: "positive" | "negative" | "info";
}

export interface CommissionResult {
    repasse: number;
    platformProfit: number;
    marginPercent: number;
    isBlocked: boolean;
    reason?: string;
    partnerCost: number;
    taxes: number;
    fixedFees: number;
    calculationSteps: CalculationStep[];
}

/**
 * Calculates the dynamic repasse and validates platform profitability.
 */
export function calculateCommission(
    salePrice: number,
    level: SellerLevel,
    isPJ: boolean,
    activeBadge?: string,
    supplierData?: {
        base_cost: number;
        tax_fixed: number;
        tax_percent: number;
    },
    productLevelCosts?: {
        bronze: number;
        prata: number;
        ouro: number;
    }
): CommissionResult {
    // 1. Determine base cost price for the seller
    let effectiveLevel = level;

    // Selo 'Start' grants Prata prices to Bronze sellers
    if (activeBadge === "Start" && level === "Bronze") {
        effectiveLevel = "Prata";
    }

    let sellerCost: number;

    if (productLevelCosts) {
        // Use product-specific costs if provided
        if (effectiveLevel === "Bronze") sellerCost = productLevelCosts.bronze;
        else if (effectiveLevel === "Prata") sellerCost = productLevelCosts.prata;
        else sellerCost = productLevelCosts.ouro;
    } else {
        // Fallback to legacy constants
        sellerCost = isPJ ? LEVEL_COSTS[effectiveLevel].PJ : LEVEL_COSTS[effectiveLevel].PF;
    }

    const steps: CalculationStep[] = [
        { label: "Preço de Venda", value: salePrice, type: "info" },
        { label: `Custo Parceiro (${effectiveLevel})`, value: -sellerCost, type: "negative" },
    ];

    // 3. Calculate external transaction costs (to be deducted from repasse)
    let transactionCosts: number;
    let taxes: number;
    let fixedFee: number;

    if (supplierData) {
        taxes = salePrice * (supplierData.tax_percent / 100);
        fixedFee = supplierData.tax_fixed;
        transactionCosts = fixedFee + taxes;
    } else {
        taxes = salePrice * FINANCE_CONSTANTS.TAX_RATE;
        fixedFee = (FINANCE_CONSTANTS.BASE_COST - 50);
        transactionCosts = fixedFee + taxes;
    }

    steps.push({ label: "Impostos s/ Venda", value: -taxes, type: "negative" });
    if (fixedFee > 0) {
        steps.push({ label: "Taxas Fixas", value: -fixedFee, type: "negative" });
    }

    // 4. Calculate Platform Costs (what the platform actually pays)
    let totalCosts: number;
    if (supplierData) {
        totalCosts = supplierData.base_cost + transactionCosts;
    } else {
        totalCosts = 50.00 + transactionCosts; // Assuming 50.00 is the supplier cost
    }

    // 5. Calculate Final Repasse (Markup - External Costs)
    // Formula: Repasse = (Sale Price - Partner Cost) - (Fees + Taxes)
    let potentialRepasse = salePrice - sellerCost - transactionCosts;

    // 6. Calculate Platform Revenue and Profit
    // Platform Revenue = what the platform keeps from the sale to cover costs and profit
    const platformRevenue = salePrice - potentialRepasse;
    const platformProfit = platformRevenue - totalCosts;
    const marginPercent = platformProfit / salePrice;

    return {
        repasse: potentialRepasse,
        platformProfit,
        marginPercent,
        isBlocked: false,
        partnerCost: sellerCost,
        taxes,
        fixedFees: fixedFee,
        calculationSteps: steps
    };
}

/**
 * Calculates XP earned for a sale.
 * Every R$ 1.00 = 1 XP.
 */
export function calculateXP(saleValue: number): number {
    return Math.floor(saleValue);
}

/**
 * Logic for Badge Buffs (Draft)
 */
export function getActiveBuffs(activeBadge: string) {
    switch (activeBadge) {
        case "Start": return "Preço de Custo nível Prata ativado.";
        case "Reativação": return "XP em dobro nas próximas 5 vendas.";
        default: return null;
    }
}
