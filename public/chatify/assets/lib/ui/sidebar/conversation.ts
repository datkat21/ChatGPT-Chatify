import Html from "@datkat21/html";
import { store } from "../../_globals.js";
import Modal from "../../modal.js";
import { makeMessage, updateMessage } from "../state.js";
import DOMPurify from "../../../scripts/purify.min.js";
import { Prompt, parseMarkdown } from "../../util.js";
import { actuallyClearMessageHistory } from "../../clearMessageHistory.js";
import { setPrompt } from "./promptPick.js";
import { CustomPrompt, loadAssistant } from "../../assistant.js";
import { importAndLoadPrompt } from "../../promptHandling.js";
import { makeMsgSeparator } from "../separator.js";

export default function convoButton(container: HTMLElement | Html) {
  return new Html("button")
    .text("Conversation...")
    .class("fg")
    .appendTo(container)
    .on("click", () => {
      const modalContent = new Html("div")
        .text("What do you want to do?")
        .append(
          new Html("div").classOn("row").appendMany(
            new Html("button")
              .text("Import")
              .classOn("fg-auto")
              .on("click", (e: Event) => {
                // Take the config from the prompt and import it ..
                const ta = new Html("textarea").attr({
                  rows: "8",
                  placeholder: '[ {"role": ..., "content": ...}, ... ]',
                });
                const modalContent = new Html("div")
                  .text("Import JSON data:")
                  .append(
                    new Html("div").classOn("column").appendMany(
                      ta,
                      new Html("button")
                        .text("Attempt Import")
                        .classOn("fg-auto")
                        .on("click", () => {
                          try {
                            const convo = JSON.parse(ta.getValue());
                            if (
                              confirm(
                                "Are you sure you want to import?\nYou will lose your current conversation if it has not been saved."
                              ) === true
                            ) {
                              md.hide();
                              if (Array.isArray(convo)) {
                                let items = convo.filter((m) => {
                                  if (m !== null && m.content && m.role) {
                                    if (m.role === "assistant") {
                                      if (
                                        m.type === "custom" ||
                                        (store.get("prompts") as Prompt[]).find(
                                          (p) => p.id === m.type
                                        ) !== undefined
                                      ) {
                                        return true;
                                      }
                                    } else if (m.role === "user") {
                                      return true;
                                    }
                                    return false;
                                  }
                                });

                                actuallyClearMessageHistory();
                                store.set("messageHistory", items);
                                for (let i = 0; i < items.length; i++) {
                                  const item = items[i];
                                  setPrompt(
                                    store
                                      .get("prompts")
                                      .find(
                                        (p: Prompt) => p.id === item.type
                                      ) || store.get("prompts")[0],
                                    false
                                  );

                                  if (store.get("assistantObj") === null) {
                                    store.set("assistantObj", loadAssistant());
                                  }

                                  let customPrompt: CustomPrompt = {
                                    avatar: "",
                                    name: "",
                                    system: "",
                                    temp: "0",
                                  };
                                  let isCustomPrompt =
                                    (item.promptId !== undefined &&
                                      item.promptId in
                                        store.get("assistantObj")) === true;

                                  if (isCustomPrompt) {
                                    customPrompt =
                                      store.get("assistantObj")[item.promptId];

                                    // Make sure the custom prompt is the last one selected
                                    const z = JSON.stringify(customPrompt);
                                    setPrompt({
                                      id: "custom",
                                      label: "Custom",
                                    });
                                    importAndLoadPrompt(z, () => {});
                                  }


                                  console.log(item);

                                  const pickedPrompt =
                                    item.role === "assistant"
                                      ? item.type === "custom"
                                        ? isCustomPrompt
                                          ? {
                                              label: customPrompt.name,
                                              id: "custom",
                                              greeting: "Unset",
                                              hint: "Unset",
                                              type: "custom",
                                              avatar: customPrompt.avatar,
                                              displayName: customPrompt.name,
                                            }
                                          : {
                                              label: "Custom (unknown)",
                                              id: "custom",
                                              greeting: "Unset",
                                              hint: "Unset",
                                              type: "builtIn",
                                              avatar:
                                                "./assets/avatars/builtin/custom.svg",
                                              displayName: "Custom (unknown)",
                                            }
                                        : (
                                            store.get("prompts") as Prompt[]
                                          ).find((p) => p.id === item.type)
                                      : item.name ?? "User";

                                  let m = makeMessage(
                                    item.role === "user" ? 0 : 1,
                                    "Thinking...",
                                    i,
                                    pickedPrompt
                                  );

                                  if (item.role === "user") {
                                    updateMessage(m.elm, item.content);
                                  } else {
                                    m.qs(".data .text")?.html(
                                      DOMPurify.sanitize(
                                        parseMarkdown(item.content)
                                        // marked.parse(item.content)
                                      )
                                    );
                                  }
                                }

                                makeMsgSeparator();
                              }
                            }
                          } catch {
                            md.hide();
                          }
                        })
                    )
                  );

                modal.hide();
                let md = new Modal(modalContent);
                md.show();
              }),
            new Html("button")
              .text("Export")
              .classOn("fg-auto")
              .on("click", () => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your conversation:")
                  .append(
                    new Html("textarea")
                      .attr({ rows: "8" })
                      .html(
                        JSON.stringify(
                          store
                            .get("messageHistory")
                            .filter((m: any) => m !== null)
                        )
                      )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              })
            // TODO: Save and load UI :(
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });
}
