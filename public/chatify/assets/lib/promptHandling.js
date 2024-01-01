import { store } from "./_globals.js";
import Html from "../scripts/html.js";
import Modal from "./modal.js";

export async function getPrompts() {
  const prompts = await fetch("/api/prompts").then((j) => j.json());

  window.prompts = JSON.parse(JSON.stringify(prompts));

  return prompts;
}

export function importAndLoadPrompt(value, cb) {
  try {
    const r = JSON.parse(value);
    if (r.system && r.temp) {
      if (r.name === undefined) r.name = false;
      if (r.avatar === undefined) r.avatar = false;
      store.get("customSettings_systemPrompt").elm.value = r.system;
      store.get("customSettings_temp").elm.value = r.temp;
      store.set("aiNameOverride", r.name || "");
      store.set("aiAvatarOverride", r.avatar || "");
      store.get("customSettings_overrideName").elm.value =
        store.get("aiNameOverride");
      store.get("customSettings_overrideAvatar").elm.value =
        store.get("aiAvatarOverride");
      cb();
    } else {
      cb();
      const btn_modalContent = new Html("div").text(
        'Something may be wrong with the prompt, please make sure it is a valid JSON object with "system" and "temp".'
      );

      const btn_modal = new Modal(btn_modalContent);
      btn_modal.show();
    }
  } catch (e) {
    cb();
    console.error(e);
    const btn_modalContent = new Html("div").html(
      "Failed to load prompt. Please make sure it is a valid JSON string!<br>Error code: " +
        e
    );

    const btn_modal = new Modal(btn_modalContent);
    btn_modal.show();
  }
}
