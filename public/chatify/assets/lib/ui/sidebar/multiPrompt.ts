import Html from "@datkat21/html";
import Modal from "../../modal";
import { promptPick } from "./promptPick";
import { Prompt, PromptPickType, PromptType } from "../../util";
import { store } from "../../_globals";
import { CustomPrompt } from "../../assistant";

export function mpGetPromptsSelected() {
  return store.get("mpPromptsSelected") as Prompt[];
}

// Set up store vars
store.set("mpPromptsSelected", []);
store.set("mpState", false);

// The first actual NEW 2024 code added to chatify
export function multiPromptUi() {
  const mpPromptsList = new Html("div").class("prompt-box");

  function renderPromptsList() {
    function makePrompt(prp: Prompt, id: number) {
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
          new Html("button")
            .text("Remove")
            .classOn("danger")
            .on("click", () => {
              mpGetPromptsSelected().splice(id, 1);
              renderPromptsList();
            })
        )
      );
    }

    mpPromptsList.clear();
    mpGetPromptsSelected().forEach((p: Prompt, i: number) => {
      mpPromptsList.append(makePrompt(p, i));
    });

    if (mpGetPromptsSelected().length > 5) {
      mpAddButton.attr({ disabled: true });
    } else {
      mpAddButton.attr({ disabled: undefined });
    }

    mpInfoCount.text(
      `You're using ${mpGetPromptsSelected().length} of 6 prompts.`
    );
  }

  const mpInfoContainer = new Html("div").class("row");

  const getMpState = () =>
    store.get("mpState") === true ? "Disable" : "Enable";

  const mpToggleButton = new Html("button")
    .class("fg-auto")
    .text(getMpState())

    .on("click", (e) => {
      const state = !store.get("mpState");
      store.set("mpState", state);
      mpToggleButton.text(getMpState());
    })
    .appendTo(mpInfoContainer);

  const mpAddButton = new Html("button")
    .text("Add")
    .appendTo(mpInfoContainer)
    .class("fg-auto")
    .on("click", async () => {
      modal.tempHide();
      let prp = (await promptPick(
        "builtIn",
        PromptPickType.SingleAssistant,
        false
      )) as Prompt | "custom" | false;

      modal.tempShow();

      if (prp === false) return;
      if (prp === "custom") return;

      const f = mpGetPromptsSelected();

      //@ts-ignore no
      if (f.find((p) => p.id === prp.id)) {
        return;
      }

      if (prp.id === "custom") {
        let CustomPrompt: CustomPrompt = store.get("loadedCustomPrompt");
        prp = {
          avatar:
            CustomPrompt.avatar !== false
              ? String(CustomPrompt.avatar)
              : "./assets/avatars/builtin/custom.svg",
          label: String(CustomPrompt.name),
          displayName: String(CustomPrompt.name),
          greeting: String(CustomPrompt.system),
          hint: `This is a custom prompt with ID ${String(CustomPrompt.id)}.`,
        };
      }

      mpGetPromptsSelected().push(prp);

      console.log(mpGetPromptsSelected());

      renderPromptsList();
    });

  const mpInfoCount = new Html("span").appendTo(mpInfoContainer);

  const mpDiv = new Html("div")
    .class("column")
    .appendMany(mpInfoContainer, mpPromptsList);

  const modalContainer = new Html("div")
    .class("column")
    .appendMany(
      new Html("span")
        .text("Multi-prompt")
        .appendMany(new Html("span").class("badge").text("BETA")),
      mpDiv
    );

  const modal = new Modal(modalContainer);

  modal.show();

  renderPromptsList();
}
