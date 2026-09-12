import { armorPackages, inventory } from "./_demo-data.mjs";

function error(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return error("Use POST to create a demo dossier.", 405);

    let input;
    try {
      input = await request.json();
    } catch {
      return error("The request body must be valid JSON.");
    }

    const vehicle = inventory.find((item) => item.id === input.vehicleId);
    const armor = armorPackages.find((item) => item.id === input.armorPackageId);
    if (!vehicle || !armor || !input.scenario) return error("A vehicle, armor package, and scenario are required.");

    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const dealReference = `KBN-${new Date().getFullYear()}-${suffix}`;
    const monthly = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(input.scenario.monthlyPayment);

    return Response.json({
      ok: true,
      dealReference,
      crm: {
        status: "DEMO_EVENT_READY",
        pipeline: "Kabin Financiamiento",
        stage: "Preanálisis",
        nextAction: "Solicitar expediente y validar capacidad financiera",
      },
      olivia: {
        status: "DEMO_ANALYSIS_READY",
        summary: `${vehicle.make} ${vehicle.model}, ${armor.label}; escenario estimado de ${monthly} a ${input.scenario.termMonths} meses. Olivia recomienda validar la documentación y el origen de los ingresos antes de enviar la solicitud a la institución financiera.`,
      },
      notice: "No personal data or CRM record is persisted in this demonstration endpoint.",
    });
  },
};
