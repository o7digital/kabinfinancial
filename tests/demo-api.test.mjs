import test from "node:test";
import assert from "node:assert/strict";
import simulate from "../api/simulate.mjs";
import lead from "../api/lead.mjs";
import { inventory, armorPackages } from "../api/_demo-data.mjs";

const selection = { vehicleId: "DMO-SUV-01", armorPackageId: "none", downPaymentPercent: 30, termMonths: 48 };
const post = (handler, body) => handler.fetch(new Request("https://demo.test/api", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
}));

test("all fictitious vehicles support each armor option with server-calculated payments", async () => {
  for (const vehicle of inventory) {
    let previous = 0;
    for (const armor of armorPackages) {
      const response = await post(simulate, { ...selection, vehicleId: vehicle.id, armorPackageId: armor.id });
      assert.equal(response.status, 200);
      const { calculation } = await response.json();
      assert.equal(calculation.unitPrice, vehicle.price);
      assert.equal(calculation.packagePrice, armor.price);
      assert.ok(calculation.monthlyPayment > previous);
      previous = calculation.monthlyPayment;
    }
  }
  const { calculation } = await (await post(simulate, selection)).json();
  assert.equal(calculation.monthlyPayment, 17072.2);
});

test("both endpoints reject invalid requests without crashing", async () => {
  for (const handler of [simulate, lead]) {
    assert.equal((await handler.fetch(new Request("https://demo.test/api"))).status, 405);
    assert.equal((await handler.fetch(new Request("https://demo.test/api", { method: "POST", body: "{" }))).status, 400);
    for (const input of [null, [], {}, { ...selection, vehicleId: "real-inventory" }, { ...selection, termMonths: 999 }, { ...selection, annualRate: 0 }]) {
      assert.equal((await post(handler, input)).status, 400);
    }
  }
});

test("demo lead uses server amounts and includes the selected term", async () => {
  const response = await post(lead, { ...selection, scenario: { monthlyPayment: 1, termMonths: 999 } });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.match(data.dealReference, /^KBN-\d{4}-[A-Z0-9]+$/);
  assert.equal(data.crm.status, "DEMO_EVENT_READY");
  assert.match(data.olivia.summary, /17,072/);
  assert.match(data.olivia.summary, /48 meses/);
  assert.doesNotMatch(data.olivia.summary, /undefined|NaN|999/);
});
