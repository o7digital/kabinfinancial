import simulate from "./simulate.mjs";

function error(message, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return error("Use POST to create a demo dossier.", 405);

    // Recalculate from validated selections; never trust client-supplied amounts.
    const simulation = await simulate.fetch(request);
    if (!simulation.ok) return simulation;
    const { vehicle, armor, calculation, inputs } = await simulation.json();

    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const dealReference = `KBN-${new Date().getFullYear()}-${suffix}`;
    const monthly = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(calculation.monthlyPayment);

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
        summary: `${vehicle.make} ${vehicle.model}, ${armor.label}; escenario estimado de ${monthly} a ${inputs.termMonths} meses. Olivia recomienda validar la documentación y el origen de los ingresos antes de enviar la solicitud a la institución financiera.`,
      },
      notice: "No personal data or CRM record is persisted in this demonstration endpoint.",
    });
  },
};
