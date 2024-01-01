import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";
import Modal from "../../modal.js";
import { updateMessage } from "../state.js";

export default function convoButton(container) {
  return new Html("button")
    .text("Conversation...")
    .class("fg")
    .appendTo(container)
    .on("click", () => {
      const modalContent = new Html("div")
        .text("What do you want to do?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("Import")
              .classOn("fg-auto")
              .on("click", (e) => {
                // Take the config from the prompt and impot it ..
                const ta = new Html("textarea").attr({
                  rows: 8,
                  placeholder: '[ {"role": ..., "content": ...}, ... ]',
                });
                const modalContent = new Html("div")
                  .text("Import JSON data:")
                  .append(
                    new Html().classOn("column").appendMany(
                      ta,
                      new Html("button")
                        .text("Attempt Import")
                        .classOn("fg-auto")
                        .on("click", (e) => {
                          try {
                            const convo = JSON.parse(ta.elm.value);
                            if (
                              this.confirm(
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
                                        prompts.find((p) => p.id === m.type) !==
                                          undefined
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
                                    prompts.find((p) => p.id === item.type) ||
                                      prompts[0],
                                    false
                                  );

                                  if (assistantObj === null) {
                                    assistantObj = loadAssistant();
                                  }

                                  let customPrompt = {};
                                  let isCustomPrompt =
                                    (item.promptId !== undefined &&
                                      item.promptId in assistantObj) === true;

                                  if (isCustomPrompt) {
                                    customPrompt = assistantObj[item.promptId];

                                    // Make sure the custom prompt is the last one selected
                                    const z = JSON.stringify(customPrompt);
                                    setPrompt({
                                      id: "custom",
                                      label: "Custom",
                                    });
                                    importAndLoadPrompt(z, (_) => {});
                                  }

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
                                        : prompts.find(
                                            (p) => p.id === item.type
                                          )
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
                                    m.query(".data .text").innerHTML =
                                      DOMPurify.sanitize(
                                        parseMarkdown(item.content)
                                        // marked.parse(item.content)
                                      );
                                  }

                                  // console.log(item, m, i, pickedPrompt);
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
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your conversation:")
                  .append(
                    new Html("textarea")
                      .attr({ rows: 8 })
                      .html(
                        JSON.stringify(
                          store.get("messageHistory").filter((m) => m !== null)
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
