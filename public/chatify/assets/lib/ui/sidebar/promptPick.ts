import Html from "@datkat21/html";
import { store } from "../../_globals.js";
import {
  CustomPrompt,
  deleteAssistant,
  loadAssistant,
} from "../../assistant.js";
import Modal from "../../modal.js";
import { makeMessage, updateMessage } from "../state.js";
import Fuse from "../../../scripts/fuse.esm.js";
import { importAndLoadPrompt } from "../../promptHandling.js";
import { Prompt, PromptPickType, PromptType } from "../../util.js";
import { multiPromptUi } from "./multiPrompt.js";

let selectedPrompt = {};
export function setPrompt(prp: Prompt, mkMsg = true) {
  const select = store.get("select");
  select.elm.value = prp.id;
  store.get("selectPromptBtn").text(prp.label);
  selectedPrompt = prp;
  if (select.elm.value === "custom") {
    store.get("customSettingsWrapper").classOff("hidden");
  } else {
    store.get("customSettingsWrapper").classOn("hidden");
  }

  if (mkMsg === true) {
    // Add a message and separator
    if (prp.greetingMessages && Array.isArray(prp.greetingMessages)) {
      const m =
        prp.greetingMessages[
          Math.floor(Math.random() * prp.greetingMessages.length)
        ];
      const index =
        store.get("messageHistory").push({
          role: "assistant",
          clientSide: true,
          type: select.elm.value,
          content: m,
        }) - 1;
      const msg = makeMessage(1, "", index, prp, true);
      let str = "";
      store.get("selectPromptBtn").elm.disabled = true;
      let i = 0;
      const update = () => {
        if (i >= m.length) {
          store.get("selectPromptBtn").elm.disabled = false;
        } else {
          str += m[i];
          updateMessage(msg.elm, str);
          i++;
          setTimeout(update, Math.floor(Math.random() * 15) / 4);
        }
      };
      setTimeout(update, Math.floor(Math.random() * 15) / 4);
    }
  }

  return selectedPrompt;
}

export function promptPick(
  focusTab: "builtIn" | "community" | "saved" = "builtIn",
  type = PromptPickType.Default,
  mkMsg: boolean = true
) {
  return new Promise((resolve, reject) => {
    const tabsButtons = new Html("div").classOn("row").classOn("fg");
    const tabsGroup = new Html("div").classOn("fg-max");

    function tabTransition(btn: Html, tab: Html) {
      promptsTab_builtInTab.classOn("extra-hidden");
      promptsTab_communityTab.classOn("extra-hidden");
      promptsTab_savedTab.classOn("extra-hidden");
      promptsTab_builtInButton.classOff("selected");
      promptsTab_communityButton.classOff("selected");
      promptsTab_savedButton.classOff("selected");
      btn.classOn("selected");
      tab.classOff("extra-hidden");
    }

    function setTabContent(
      tab: Html,
      prompts: Prompt[],
      savedPromptsShowDeleteButton: boolean = false
    ) {
      function makePrompt(prp: Prompt) {
        return new Html("div").classOn("prompt").appendMany(
          new Html("div").classOn("assistant").appendMany(
            new Html("div")
              .classOn("who")
              .attr({
                "data-mode": String(prp.id),
                style:
                  prp.avatar !== null && prp.avatar !== undefined
                    ? `--icon:url(${prp.avatar})`
                    : "--icon:url(./assets/avatars/builtin/custom.svg)",
              })
              .appendMany(
                new Html("div").classOn("icon"),
                new Html("div")
                  .classOn("name")
                  .attr({ title: String(prp.id) })
                  .text(String(prp.label))
              ),
            new Html("div").classOn("greeting").text(String(prp.greeting)),
            new Html("div").classOn("hint").text(String(prp.hint))
          ),
          new Html("div").classOn("controls").appendMany(
            new Html("button").text("Select").on("click", () => {
              if (prp.type !== undefined && prp.type !== PromptType.Saved) {
                setPrompt(prp, mkMsg);
                store.set('currentPrompt', prp);
                modal.hide();
                resolve(prp);
              } else {
                // New custom prompt handling
                setPrompt({ id: "custom", label: "Custom" }, mkMsg);
                store.set(
                  "loadedCustomPrompt",
                  assistantObj[prp.id?.toString() as string]
                );
                store.get("loadedCustomPrompt").id = prp.id;
                const z = JSON.stringify(store.get("loadedCustomPrompt"));

                importAndLoadPrompt(z, () => {
                  modal.hide();
                  resolve(selectedPrompt);
                });
              }
            }),
            savedPromptsShowDeleteButton === true
              ? new Html("button")
                  .text("Delete")
                  .classOn("danger")
                  .on("click", () => {
                    if (prp.type !== PromptType.Saved) {
                      setPrompt(prp, mkMsg);
                      modal.hide();
                    } else {
                      let mdl: Modal;
                      const modalContainer = new Html("div").appendMany(
                        new Html("p")
                          .class("mt-0")
                          .text("Are you sure you want to delete this prompt?"),

                        new Html("div").classOn("prompt-box").append(
                          new Html("div").classOn("prompt").append(
                            new Html("div").classOn("assistant").appendMany(
                              new Html("div")
                                .classOn("who")
                                .attr({
                                  "data-mode": String(prp.id),
                                  style:
                                    prp.avatar !== null &&
                                    prp.avatar !== undefined
                                      ? `--icon:url(${prp.avatar})`
                                      : "--icon:url(./assets/avatars/builtin/custom.svg)",
                                })
                                .appendMany(
                                  new Html("div").classOn("icon"),
                                  new Html("div")
                                    .classOn("name")
                                    .attr({ title: String(prp.id) })
                                    .text(String(prp.label))
                                ),
                              new Html("div")
                                .classOn("greeting")
                                .text(String(prp.greeting)),
                              new Html("div")
                                .classOn("hint")
                                .text(String(prp.hint))
                            )
                          )
                        ),

                        new Html("div")
                          .classOn("fg-auto", "row", "pb-0")
                          .append(
                            new Html("button")
                              .text("OK")
                              .classOn("fg-auto")
                              .on("click", () => {
                                deleteAssistant(prp.id as string);
                                mdl.hide();
                                modal.hide();
                                return promptPick("saved");
                              })
                          )
                          .append(
                            new Html("button")
                              .text("Cancel")
                              .classOn("danger", "fg-auto")
                              .on("click", () => {
                                mdl.hide();
                              })
                          )
                      );

                      mdl = new Modal(modalContainer);
                      mdl.show();
                    }
                  })
              : null
          )
        );
      }

      const container = new Html("div").classOn("prompt-box").appendTo(tab);
      const controlsBox = new Html("div")
        .classOn("prompt-box")
        .appendTo(container);
      const promptBox = new Html("div")
        .classOn("prompt-box")
        .appendTo(container);

      const searchBar = new Html("input")
        .attr({ type: "text", placeholder: "Search..." })
        .on("input", (e: Event) => {
          // Setup fuse.js
          const options = {
            keys: ["name", "system", "greeting", "displayName", "hint"], // Properties to search in
            shouldSort: true, // Sort the results by score
          };

          const fuse = new Fuse(prompts, options);

          const term = (e.target as HTMLInputElement).value;

          if (term === "") {
            promptBox.html("");
            prompts.forEach((prp) => {
              const i = makePrompt(prp);
              i.appendTo(promptBox);
            });
            return;
          }

          const searchResults = fuse.search(term) as {
            refIndex: number;
          }[];

          promptBox.html("");

          if (searchResults.length > 0)
            searchResults.forEach((r) => {
              const i = r.refIndex;

              makePrompt(prompts[i]).appendTo(promptBox);
            });
          else
            promptBox.html(
              `<i style="color:var(--text-color-accent);">Your search had no results.</i>`
            );
        });

      controlsBox.appendMany(
        new Html("div").class("row", "py-0").appendMany(
          new Html("button")
            .text("Create your own prompt")
            .classOn("fg-auto")
            .on("click", () => {
              setPrompt({ id: "custom", label: "Custom" }, mkMsg);
              modal.hide();
              resolve("custom");
            }),
          new Html("button")
            .text("Scroll to bottom")
            .classOn("transparent", "fg-auto")
            .on("click", () => {
              modal.modal.elm.scrollTo({
                top: modal.modal.elm.scrollHeight,
                behavior: "smooth",
              });
            }),
          type === PromptPickType.Default
            ? new Html("button")
                .text(
                  `Multi-prompt ${store.get("mpState") === true ? "(On)" : "(Off)"}`
                )
                .append(new Html("span").class("badge").text("BETA"))
                .classOn("transparent", "fg-auto")
                .on("click", () => {
                  modal.hide();
                  multiPromptUi();
                })
            : undefined
        ),
        searchBar
      );

      prompts.forEach((prp) => {
        const i = makePrompt(prp);
        i.appendTo(promptBox);
      });
    }

    const promptsTab_builtInButton = new Html("button")
      .classOn("tab-selector")
      .classOn("fg")
      .text("Built-In")
      .on("click", () => {
        tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_builtInTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup);

    setTabContent(
      promptsTab_builtInTab,
      (store.get("prompts") as Prompt[]).filter(
        (p) => p.type === PromptType.BuiltIn
      )
    );

    const promptsTab_communityButton = new Html("button")
      .classOn("tab-selector")
      .classOn("fg")
      .text("Community")
      .on("click", () => {
        tabTransition(promptsTab_communityButton, promptsTab_communityTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_communityTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup);

    setTabContent(
      promptsTab_communityTab,
      (store.get("prompts") as Prompt[])
        .filter((p) => p.type === PromptType.Community)
        .sort((a, b) => {
          if (a.hint !== undefined && b.hint !== undefined) {
            if (a.hint > b.hint) {
              return -1;
            }
            if (a.hint < b.hint) {
              return 1;
            }
          }
          return 0;
        })
    );

    const promptsTab_savedButton = new Html("button")
      .classOn("tab-selector")
      .classOn("fg")
      .text("Saved")
      .on("click", () => {
        tabTransition(promptsTab_savedButton, promptsTab_savedTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_savedTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup);
    const assistantObj = loadAssistant() as Record<string, CustomPrompt>;

    store.set("assistantObj", assistantObj);

    let assistantKeys = Object.keys(assistantObj);
    let assistantArray = Object.values(assistantObj);
    let assistantHtml = assistantKeys.map((key) => {
      const p = assistantObj[key];
      return {
        avatar: p.avatar !== false ? p.avatar : undefined,
        displayName: p.name !== false ? p.name : undefined,
        greeting: p.system,
        hint: "This is one of your custom prompts.",
        id: key,
        label: p.name !== false ? p.name : "null",
        type: PromptType.Saved,
      };
    });

    setTabContent(promptsTab_savedTab, assistantHtml, true);

    const modalContent = new Html("div")
      .class("fg")
      .append(new Html("span").text("Prompt selection"))
      .append(new Html("div").appendMany(tabsButtons).appendMany(tabsGroup));

    if (focusTab !== undefined) {
      switch (focusTab) {
        case "builtIn":
          tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);
          break;
        case "community":
          tabTransition(promptsTab_communityButton, promptsTab_communityTab);
          break;
        case "saved":
          tabTransition(promptsTab_savedButton, promptsTab_savedTab);
          break;
      }
    } else tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);

    // controlsBox.appendMany(
    //   new Html("div").class("row", "py-0").appendMany(
    //     new Html("button")
    //       .text("Scroll to top")
    //       .classOn("transparent", "fg-auto")
    //       .on("click", (e) => {
    //         modal.modal.elm.scrollTo({
    //           top: 0,
    //           behavior: "smooth",
    //         });
    //       })
    //   ),
    // );

    const modal = new Modal(modalContent);
    modal.show();

    modal.modal.qs(".close-btn")?.on("click", () => {
      resolve(false); // User closed the dialog
    });
  });
}
