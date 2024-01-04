import { store } from "./_globals.js";
import { futureDate } from "./util.js";

let apiUsage = {
  used: 0,
  remaining: 0,
  total: 0,
  expires: "",
  plan: "free",
  allowMultiPrompt: false
};

export async function checkRequests() {
  await fetch("/api/usage")
    .then((j) => j.json())
    .then((j) => {
      apiUsage = j;
      store.set("apiUsage", apiUsage);
    });
}

await checkRequests();

export function updateRequestsMessage() {
  const apiUsage = store.get("apiUsage");
  if (apiUsage.remaining !== null) {
    store
      .get("requestUi_text")
      .text(
        `${apiUsage.used} of ${apiUsage.total} requests used (${apiUsage.plan}).`
      );
    store.get("requestUi_meter").attr({
      value: apiUsage.used,
      max: apiUsage.total,
    });
    store.get("requestUi_meter").query("div").style.width =
      (apiUsage.used / apiUsage.total) * 100 + "%";
    store.get("requestUi_meter").classOff("extra-hidden");
    store
      .get("requestUi_hint")
      .text(`Your quota resets ${futureDate(new Date(apiUsage.expires))}.`);
  } else {
    store
      .get("requestUi_text")
      .text(`0 of ${apiUsage.total} requests used (${apiUsage.plan}).`);
    store.get("requestUi_meter").classOn("extra-hidden");
    store.get("requestUi_hint").text("");
  }
}
