import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";
import { deleteAssistant, loadAssistant } from "../../assistant.js";
import Modal from "../../modal.js";
import { makeMessage, updateMessage } from "../state.js";
import Fuse from "../../../scripts/fuse.esm.js";
import { importAndLoadPrompt } from "../../promptHandling.js";

let selectedPrompt = {};
export function setPrompt(prp, mkMsg = true) {
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

export function promptPick(focusTab = "builtIn") {
  return new Promise((resolve, reject) => {
    const tabsButtons = new Html().classOn("row").classOn("fg");
    const tabsGroup = new Html().classOn("fg-max");

    function tabTransition(btn, tab) {
      promptsTab_builtInTab.classOn("extra-hidden");
      promptsTab_communityTab.classOn("extra-hidden");
      promptsTab_savedTab.classOn("extra-hidden");
      promptsTab_builtInButton.classOff("selected");
      promptsTab_communityButton.classOff("selected");
      promptsTab_savedButton.classOff("selected");
      btn.classOn("selected");
      tab.classOff("extra-hidden");
    }

    function setTabContent(tab, prompts, savedPromptsShowDeleteButton) {
      function makePrompt(prp) {
        return new Html().classOn("prompt").appendMany(
          new Html().classOn("assistant").appendMany(
            new Html()
              .classOn("who")
              .attr({
                "data-mode": prp.id,
                style:
                  prp.avatar !== null && prp.avatar !== undefined
                    ? `--icon:url(${prp.avatar})`
                    : "--icon:url(./assets/avatars/builtin/custom.svg)",
              })
              .appendMany(
                new Html().classOn("icon"),
                new Html()
                  .classOn("name")
                  .attr({ title: prp.id })
                  .text(prp.label)
              ),
            new Html().classOn("greeting").text(prp.greeting),
            new Html().classOn("hint").text(prp.hint)
          ),
          new Html().classOn("controls").appendMany(
            new Html("button").text("Select").on("click", (e) => {
              if (prp.type !== "saved") {
                setPrompt(prp);
                modal.hide();
                resolve(prp);
              } else {
                // New custom prompt handling
                setPrompt({ id: "custom", label: "Custom" });
                store.set('loadedCustomPrompt', assistantObj[prp.id]);
                store.get('loadedCustomPrompt').id = prp.id;
                const z = JSON.stringify(store.get('loadedCustomPrompt'));

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
                  .on("click", (e) => {
                    if (prp.type !== "saved") {
                      setPrompt(prp);
                      modal.hide();
                    } else {
                      let mdl;
                      const modalContainer = new Html().appendMany(
                        new Html("p")
                          .class("mt-0")
                          .text("Are you sure you want to delete this prompt?"),

                        new Html().classOn("prompt-box").append(
                          new Html().classOn("prompt").append(
                            new Html().classOn("assistant").appendMany(
                              new Html()
                                .classOn("who")
                                .attr({
                                  "data-mode": prp.id,
                                  style:
                                    prp.avatar !== null &&
                                    prp.avatar !== undefined
                                      ? `--icon:url(${prp.avatar})`
                                      : "--icon:url(./assets/avatars/builtin/custom.svg)",
                                })
                                .appendMany(
                                  new Html().classOn("icon"),
                                  new Html()
                                    .classOn("name")
                                    .attr({ title: prp.id })
                                    .text(prp.label)
                                ),
                              new Html().classOn("greeting").text(prp.greeting),
                              new Html().classOn("hint").text(prp.hint)
                            )
                          )
                        ),

                        new Html()
                          .classOn("fg-auto", "row", "pb-0")
                          .append(
                            new Html("button")
                              .text("OK")
                              .classOn("fg-auto")
                              .on("click", (e) => {
                                deleteAssistant(prp.id);
                                mdl.hide();
                                modal.hide();
                                return promptPick("saved");
                              })
                          )
                          .append(
                            new Html("button")
                              .text("Cancel")
                              .classOn("danger", "fg-auto")
                              .on("click", (e) => {
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

      const container = new Html().classOn("prompt-box").appendTo(tab);
      const controlsBox = new Html().classOn("prompt-box").appendTo(container);
      const promptBox = new Html().classOn("prompt-box").appendTo(container);

      const searchBar = new Html("input")
        .attr({ type: "text", placeholder: "Search..." })
        .on("input", (e) => {
          // Setup fuse.js
          const options = {
            keys: ["name", "system", "greeting", "displayName", "hint"], // Properties to search in
            shouldSort: true, // Sort the results by score
          };

          const fuse = new Fuse(prompts, options);

          const term = e.target.value;

          if (term === "") {
            promptBox.html("");
            prompts.forEach((prp) => {
              const i = makePrompt(prp);
              i.appendTo(promptBox);
            });
            return;
          }

          const searchResults = fuse.search(term);

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
            .on("click", (e) => {
              setPrompt({ id: "custom", label: "Custom" });
              modal.hide();
              resolve("custom");
            }),
          new Html("button")
            .text("Scroll to bottom")
            .classOn("transparent", "fg-auto")
            .on("click", (e) => {
              modal.modal.elm.scrollTo({
                top: modal.modal.elm.scrollHeight,
                behavior: "smooth",
              });
            })
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
      .on("click", (e) => {
        tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_builtInTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup)
      .append();

    setTabContent(
      promptsTab_builtInTab,
      prompts.filter((p) => p.type === "builtIn")
    );

    const promptsTab_communityButton = new Html("button")
      .classOn("tab-selector")
      .classOn("fg")
      .text("Community")
      .on("click", (e) => {
        tabTransition(promptsTab_communityButton, promptsTab_communityTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_communityTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup);

    setTabContent(
      promptsTab_communityTab,
      prompts
        .filter((p) => p.type === "community")
        .sort((a, b) => {
          if (a.hint > b.hint) {
            return -1;
          }
          if (a.hint < b.hint) {
            return 1;
          }
          return 0;
        })
    );

    const promptsTab_savedButton = new Html("button")
      .classOn("tab-selector")
      .classOn("fg")
      .text("Saved")
      .on("click", (e) => {
        tabTransition(promptsTab_savedButton, promptsTab_savedTab);
      })
      .appendTo(tabsButtons);

    const promptsTab_savedTab = new Html("div")
      .classOn("tab")
      .appendTo(tabsGroup);
    const assistantObj = loadAssistant();

    store.set("assistantObj", assistantObj);

    let assistantKeys = Object.keys(assistantObj);
    let assistantArray = Object.values(assistantObj);
    let assistantHtml = assistantKeys.map((key) => {
      const p = assistantObj[key];
      return {
        avatar: p.avatar !== false ? p.avatar : null,
        displayName: p.name !== false ? p.name : null,
        greeting: p.system,
        hint: "This is one of your custom prompts.",
        id: key,
        label: p.name !== false ? p.name : null,
        type: "saved",
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

    modal.modal.elm
      .querySelector(".close-btn")
      .addEventListener("click", (_) => {
        resolve(false); // User closed the dialog
      });
  });
}
