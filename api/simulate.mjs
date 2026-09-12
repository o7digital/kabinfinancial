import { armorPackages, financingDefaults, inventory } from "./_demo-data.mjs";

const currency = (value) => Math.round(value * 100) / 100;

function error(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return error("Use POST to create a financing scenario.", 405);
    }

    let input;
    try {
      input = await request.json();
    } catch {
      return error("The request body must be valid JSON.");
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return error("The request body must be a JSON object.");
    }

    const vehicle = inventory.find((item) => item.id === input.vehicleId);
    const armor = armorPackages.find((item) => item.id === input.armorPackageId);
    const downPaymentPercent = Number(input.downPaymentPercent);
    const termMonths = Number(input.termMonths);

    if (!vehicle) return error("Selected vehicle was not found.");
    if (!armor) return error("Selected armor package was not found.");
    if (!financingDefaults.allowedDownPayments.includes(downPaymentPercent)) {
      return error("The down payment percentage is outside the demo policy.");
    }
    if (!financingDefaults.allowedTerms.includes(termMonths)) {
      return error("The term is outside the demo policy.");
    }

    const annualRate = Number(input.annualRate ?? financingDefaults.annualRate);
    if (!Number.isFinite(annualRate) || annualRate < 8 || annualRate > 35) {
      return error("The annual rate must be between 8% and 35%.");
    }

    const unitPrice = vehicle.price;
    const packagePrice = armor.price;
    const insurance = currency((unitPrice + packagePrice) * (financingDefaults.insuranceRate / 100));
    const subtotal = currency(unitPrice + packagePrice + insurance);
    const downPayment = currency(subtotal * (downPaymentPercent / 100));
    const openingFee = currency((subtotal - downPayment) * (financingDefaults.openingFeeRate / 100));
    const financedAmount = currency(subtotal - downPayment + openingFee);
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = currency(
      financedAmount * ((monthlyRate * (1 + monthlyRate) ** termMonths) / ((1 + monthlyRate) ** termMonths - 1)),
    );
    const totalCreditCost = currency(monthlyPayment * termMonths - financedAmount);

    return Response.json({
      ok: true,
      calculatedAt: new Date().toISOString(),
      policyVersion: "KABIN-DEMO-0.1",
      vehicle,
      armor,
      inputs: { downPaymentPercent, termMonths, annualRate },
      calculation: {
        unitPrice,
        packagePrice,
        insurance,
        subtotal,
        downPayment,
        openingFee,
        financedAmount,
        monthlyPayment,
        totalCreditCost,
      },
      disclosures: [
        "Demostración funcional: las reglas se calculan del lado del servidor.",
        "La tasa, el seguro, el blindaje y la disponibilidad deben confirmarse antes de emitir una propuesta vinculante.",
      ],
    });
  },
};
