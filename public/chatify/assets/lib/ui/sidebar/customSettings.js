import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";
import { loadAssistant, saveAssistant } from "../../assistant";
import Modal from "../../modal.js";
import { importAndLoadPrompt } from "../../promptHandling.js";
import { toSnakeCase } from "../../util.js";

export default function customSettings(sideBar) {
  store.set("aiNameOverride", false);
  store.set("aiAvatarOverride", false);

  const customSettingsWrapper = new Html()
    .class("column", "pb-2", "pt-0", "hidden")
    .appendTo(sideBar);

  store.set("customSettingsWrapper", customSettingsWrapper);

  console.log(store.get("customSettingsWrapper"));

  const customSettings_systemPrompt = new Html("textarea")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "System prompt", rows: "4" });
  const customSettings_overrideName = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "Bot Name Override" })
    .on("input", (e) => {
      store.set("aiNameOverride", e.target.value);
      if (store.get("aiNameOverride") == "") {
        store.set("aiNameOverride", false);
      }
    });
  const customSettings_overrideAvatar = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({
      type: "text",
      placeholder: "Avatar Override, ex. https://...png",
    })
    .on("input", (e) => {
      store.set("aiAvatarOverride", e.target.value);
      if (store.get("aiAvatarOverride") == "") {
        store.set("aiAvatarOverride", false);
      }
    });

  store.set("customSettings_systemPrompt", customSettings_systemPrompt);
  store.set("customSettings_overrideName", customSettings_overrideName);
  store.set("customSettings_overrideAvatar", customSettings_overrideAvatar);

  const customSettings_tempWrapper = new Html("span")
    .classOn("row", "py-0")
    .appendTo(customSettingsWrapper);

  const customSettings_buttonsWrapper = new Html("span")
    .classOn("row", "py-0")
    .appendTo(customSettingsWrapper);

  new Html("button")
    .text("Import")
    .classOn("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config from the prompt and import it ..
      const ta = new Html("textarea").attr({ rows: 8, placeholder: "{ ... }" });

      const modalContent = new Html("div").text("Import JSON data:").append(
        new Html().classOn("column").appendMany(
          ta,
          new Html("button")
            .text("Attempt Import")
            .classOn("fg-auto")
            .on("click", (e) => {
              importAndLoadPrompt(ta.elm.value, () => {
                modal.hide();
              });
            })
        )
      );

      const modal = new Modal(modalContent);
      modal.show();
    });
  new Html("button")
    .text("Export")
    .class("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config and export it
      const modalContent = new Html("div")
        .text("How do you want to export?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("JSON Export")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your exported prompt:")
                  .append(
                    new Html("textarea").attr({ rows: 8 }).html(
                      JSON.stringify({
                        system: customSettings_systemPrompt.elm.value,
                        temp: customSettings_temp.elm.value,
                        avatar: store.get("aiAvatarOverride"),
                        name: store.get("aiNameOverride"),
                      })
                    )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              }),
            new Html("button")
              .text("Add to Saved")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();

                const z = loadAssistant();

                const x =
                  store.get("aiNameOverride") ||
                  "prompt-" + Object.keys(z).length;

                const y = toSnakeCase(x);

                if (z[y]) {
                  if (
                    confirm(
                      `Saving this prompt with the same name as "${y}" will forcefully overwrite it.\nAre you sure you want to do this?`
                    ) === true
                  ) {
                    saveAssistant(y, {
                      system: customSettings_systemPrompt.elm.value,
                      temp: customSettings_temp.elm.value,
                      avatar: store.get("aiAvatarOverride"),
                      name: x,
                    });
                  } else {
                    return;
                  }
                } else {
                  saveAssistant(y, {
                    system: customSettings_systemPrompt.elm.value,
                    temp: customSettings_temp.elm.value,
                    avatar: store.get("aiAvatarOverride"),
                    name: store.get("aiNameOverride"),
                  });
                }

                let m = new Html("span").text(
                  "Saved! Open the prompt picker and go to Saved to see your creation."
                );

                let md = new Modal(m);
                md.show();
              })
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });

  new Html("label")
    .attr({ for: "temp" })
    .text("Temperature")
    .appendTo(customSettings_tempWrapper);
  const customSettings_temp = new Html("input")
    .attr({ id: "temp", type: "range", min: "0", max: "1", step: "0.01" })
    .appendTo(customSettings_tempWrapper);
  store.set("customSettings_temp", customSettings_temp);
}
