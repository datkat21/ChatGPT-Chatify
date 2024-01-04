import Html from "@datkat21/html";
import { store } from "../_globals.js";
import { checkRequests, updateRequestsMessage } from "../apiUsage.js";
import { callAiMessage } from "../callApi.js";
import Modal from "../modal.js";
import { Prompt, parseMarkdown, scrollDown } from "../util.js";
import { autoExpandTextArea } from "./messages.js";
import { ICONS } from "./icons.js";
import DOMPurify from "../../scripts/purify.min.js";
import { mpGetPromptsSelected } from "./sidebar/multiPrompt.js";
import { CustomPrompt, loadAssistant } from "../assistant.js";
import { setPrompt } from "./sidebar/promptPick.js";
import { importAndLoadPrompt } from "../promptHandling.js";

let isTyping = false; // This will be true at any point message generation begins
let currentSocket = null;
let hasSetUp = false;

store.set("currentSocket", currentSocket);

export function makeMessage(
  side = 0,
  data: string,
  messageIndex: number,
  prompt: Prompt | string | null = null,
  isSystem = false,
  actuallyGoesToMessageHistory = true
) {
  if (messageIndex === undefined)
    messageIndex = store.get("messageHistory").length;
  const msg = new Html("div").class("message");
  const messageContentWrapper = new Html("div").class("wrapper").appendTo(msg);
  const icon = new Html("div").class("icon").appendTo(messageContentWrapper);
  const dataContainer = new Html("div")
    .class("data", "fg-max")
    .appendTo(messageContentWrapper);
  const extra = new Html("div").class("column").appendTo(msg);
  const uname = new Html("div").class("name").appendTo(dataContainer);
  const text = new Html("div").class("text").appendTo(dataContainer);
  switch (side) {
    case 0:
      msg.class("user");
      dataContainer.class("muted");
      text.html(data);
      if (prompt) {
        uname.text(String(prompt));
      } else {
        uname.text(store.get("userName"));
      }
      break;
    case 1:
      msg.class("gpt");
      const select = store.get("select");
      msg.elm.dataset.mode = select.elm.value;
      uname.text(
        select.elm.querySelector(
          'select option[value="' + select.elm.value + '"]'
        ).value
      );
      // Only Prompt type should be given for assistant.
      prompt = prompt as Prompt;
      if (prompt !== null) {
        if (prompt.avatar !== null && prompt.avatar !== undefined) {
          msg.style({ "--icon": "url(" + prompt.avatar + ")" });
        } else {
          msg.style({ "--icon": "url(./assets/avatars/builtin/custom.svg)" });
        }
        if (prompt.displayName !== null && prompt.displayName !== undefined) {
          uname.text(prompt.displayName);
        }
      }
      if (select.elm.value === "custom") {
        if (store.get("aiAvatarOverride") !== false) {
          icon.style({
            "background-image": "url(" + store.get("aiAvatarOverride") + ")",
          });
        }
        if (store.get("aiNameOverride") !== false) {
          uname.text(store.get("aiNameOverride"));
        }
      }
      if (isSystem === true)
        uname.elm.innerHTML += '<span class="badge">System</span>';
      break;
  }
  if (isSystem === false || actuallyGoesToMessageHistory === true) {
    extra.appendMany(
      new Html("button")
        .class("transparent", "fg-auto", "small")
        .html(ICONS.trashCan)
        .on("click", () => {
          let modal: Modal;
          const modalContainer = new Html("div")
            .text("Are you sure you want to delete this message?")
            .append(
              new Html("div")
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", () => {
                      store.get("messageHistory")[messageIndex] = null;
                      window.mh = store.get("messageHistory");
                      msg.cleanup();
                      modal.hide();
                    })
                )
                .append(
                  new Html("button")
                    .text("Cancel")
                    .classOn("danger", "fg-auto")
                    .on("click", () => {
                      modal.hide();
                    })
                )
            );

          modal = new Modal(modalContainer);
          modal.show();
        }),
      new Html("button")
        .class("transparent", "fg-auto", "small")
        .html(ICONS.copy)
        .on("click", () => {
          let text = store.get("messageHistory")[messageIndex].content;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
          } else {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }
        }),
      new Html("button")
        .class("transparent", "fg-auto", "small")
        .html(ICONS.edit)
        .on("click", () => {
          let text = store.get("messageHistory")[messageIndex].content;

          const textArea = new Html("textarea")
            .classOn("mt-1")
            .attr({ rows: "8", placeholder: "Message content is empty" })
            .val(text);

          let modal: Modal;

          const modalContainer = new Html("div")
            .text(`Edit Message #${messageIndex}`)
            .appendMany(
              textArea,
              new Html("div")
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", () => {
                      let editedValue = textArea.getValue();
                      updateMessage(msg.elm, editedValue);
                      store.get("messageHistory")[messageIndex].content =
                        editedValue;
                      modal.hide();
                    })
                )
                .append(
                  new Html("button")
                    .text("Cancel")
                    .classOn("danger", "fg-auto")
                    .on("click", () => {
                      modal.hide();
                    })
                )
            );
          modal = new Modal(modalContainer);
          modal.show();
        })
    );
  } else {
    extra.append(
      new Html("button")
        .class("transparent")
        .html(ICONS.trashCan)
        .on("click", () => {
          let modal: Modal;
          const modalContainer = new Html("div")
            .text("Are you sure you want to delete this message?")
            .append(
              new Html("div")
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", () => {
                      msg.cleanup();
                      modal.hide();
                    })
                )
                .append(
                  new Html("button")
                    .text("Cancel")
                    .classOn("danger", "fg-auto")
                    .on("click", () => {
                      modal.hide();
                    })
                )
            );
          modal = new Modal(modalContainer);
          modal.show();
        })
    );
  }
  msg.appendTo(store.get("messagesContainer"));
  window.mh = store.get("messageHistory");
  scrollDown();
  return msg;
}

export function updateMessage(
  messageRef: HTMLElement,
  data: string | null = null
) {
  let x = messageRef.querySelector(".data");
  let y = messageRef.querySelector(".data .text");

  if (x !== null) x.classList.remove("muted", "dots-flow");
  if (data !== null) {
    if (data.startsWith('"')) data = data.slice(1);
    if (data.endsWith('"')) data = data.slice(0, -1);
    if (y !== null) y.innerHTML = DOMPurify.sanitize(parseMarkdown(data));
  }
}

export async function request(text: string, addUserMessage = true) {
  if (store.get("mpState") === true) {
    // call GetPersonality if mp is enabled.
    if (mpGetPromptsSelected().length === 0) {
      alert(
        "You don't have any prompts in your multi-prompt.\nConfigure multi-prompt options in the Prompt Selection modal."
      );

      store.get("inputArea").elm.value = text;

      return;
    }

    // let message = `${store.get("userName")}: ${String(text)}`;

    const userIndex =
      store.get("messageHistory").push({
        role: "user",
        content: text,
        name: store.get("userSettings").username,
      }) - 1;

    let human: Html = new Html("div");
    if (addUserMessage === true) {
      human = makeMessage(
        0,
        DOMPurify.sanitize(parseMarkdown(text)),
        userIndex
      );
    }

    let finalResponse: string[] | false = false;

    const personalities = await fetch("/api/getPersonality", {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: text.substring(0, 1024),
        characters: mpGetPromptsSelected().map((p) => p.displayName),
        prevTalkingTo: store.get("select").elm.value,
      }),
    });

    let prevTalkingTo: string | null = null;

    finalResponse = await personalities.json();

    console.log("Personalities:", finalResponse);

    if (finalResponse === false) {
      return alert("Multi-prompt error: Couldn't detect a prompt to use.");
    }

    // This part only goes once
    updateMessage(human.elm);

    // This part loops
    for (let i = 0; i < finalResponse.length; i++) {
      const currentPrompt = finalResponse[i];

      store.get("messageHistory").push({
        role: "user",
        name: store.get("userSettings").username,
        content:
          prevTalkingTo != null
            ? `Respond as ${currentPrompt} after ${prevTalkingTo}.`
            : `Respond as ${currentPrompt}.`,
      }) - 1;

      const prompt = (store.get("prompts") as Prompt[]).find(
        (p) => p.displayName === currentPrompt
      );

      if (prompt === undefined) {
        // search in custom prompts instead
        const assistants = loadAssistant() as Record<string, CustomPrompt>;

        const customPromptId = await new Promise((resolve, reject) => {
          Object.keys(assistants).forEach((a) => {
            if (assistants[a].name === currentPrompt) {
              resolve(a);
            }
          });
        });

        // set the custom prompt
        setPrompt({ id: "custom", label: "Custom" }, false);
        store.set("loadedCustomPrompt", assistants[customPromptId as string]);
        store.get("loadedCustomPrompt").id = customPromptId;

        const z = JSON.stringify(store.get("loadedCustomPrompt"));

        importAndLoadPrompt(z, () => {});
      } else {
        setPrompt(prompt, false);
      }

      const aiIndex =
        store.get("messageHistory").push({
          role: "assistant",
          type: store.get("select").elm.value,
          content: "Thinking...",
        }) - 1;

      console.log("Selected prompt vs current prompt:", currentPrompt, prompt);

      let ai = makeMessage(1, "", aiIndex, prompt);

      isTyping = true;
      updateState();

      store.get("deleteConvoButton").elm.disabled = true; // Required otherwise bad things happen

      let result = await callAiMessage(ai.elm, text);

      store.get("messageHistory")[aiIndex].content = result;

      isTyping = false;
      updateState();

      store.get("deleteConvoButton").elm.disabled = false;
      prevTalkingTo = currentPrompt;
    }
  } else {
    // Default mode
    const userIndex =
      store.get("messageHistory").push({
        role: "user",
        content: text,
        name: store.get("userSettings").username,
      }) - 1;

    const aiIndex =
      store.get("messageHistory").push({
        role: "assistant",
        type: store.get("select").elm.value,
        content: "Thinking...",
      }) - 1;

    if (store.get("select").elm.value === "custom") {
      // Custom prompts handle differently than normal ones, so we save custom data
      if (!store.get("loadedCustomPrompt").id) {
        // Something is wrong as we have a custom prompt set but it hasn't filled the custom prompt data
        // return alert(
        //   "Unable to load your request because the custom prompt is not properly set."
        // );
      } else
        store.get("messageHistory")[aiIndex].promptId =
          store.get("loadedCustomPrompt").id;
    }

    const prompt =
      (store.get("prompts") as Prompt[]).find(
        (p) => p.id === store.get("select").elm.value
      ) || (store.get("prompts") as Prompt[])[0];

    let human: Html = new Html("div");
    if (addUserMessage === true) {
      human = makeMessage(
        0,
        DOMPurify.sanitize(parseMarkdown(text)),
        userIndex
      );
    }

    let ai = makeMessage(1, "", aiIndex, prompt);

    isTyping = true;
    updateState();

    store.get("deleteConvoButton").elm.disabled = true; // Required otherwise bad things happen

    let result = await callAiMessage(ai.elm, text);

    updateMessage(human.elm);
    store.get("messageHistory")[aiIndex].content = result;

    isTyping = false;
    updateState();

    store.get("deleteConvoButton").elm.disabled = false;
  }

  await checkRequests();
  updateRequestsMessage();
}

const b4UnloadHandler = () => {
  return null;
};

export function startTextGeneration() {
  if (isTyping) return false;
  request(store.get("inputArea").elm.value);
  store.get("inputArea").elm.value = "";
  scrollDown();
  autoExpandTextArea();
  if (hasSetUp === false) {
    console.log("setting b4unload!");
    window.addEventListener("beforeunload", b4UnloadHandler, {
      capture: true,
    });
    hasSetUp = true;
  }
}

export function sendButton_StopGeneration() {
  try {
    // Prematurely end the socket and return to the normal state
    if (store.get("currentSocket")?.cancel) {
      store
        .get("currentSocket")
        .cancel("stop button")
        .then(() => {
          // Send a response back to the callAiStream
          window.dispatchEvent(
            new CustomEvent("chatify-premature-end", {
              detail: { data: "stop button", error: false },
            })
          );
        });
    }
  } catch (e) {
    console.log("failed to close");
  }
}
export function sendButton_StartGeneration() {
  if (!isTyping) {
    startTextGeneration();
  }
}

export function updateState() {
  switch (isTyping) {
    case true:
      store.get("inputArea").attr({ placeholder: "Thinking..." });
      store
        .get("sendButton")
        .classOn("neutral")
        .html(ICONS.stop)
        .on("click", sendButton_StopGeneration)
        .un("click", sendButton_StartGeneration);
      // console.log("truthy condition met", inputArea, sendButton);
      break;
    case false:
      store.get("inputArea").attr({ placeholder: "Message" });
      store
        .get("sendButton")
        .classOff("neutral")
        .html(ICONS.send)
        .on("click", sendButton_StartGeneration)
        .un("click", sendButton_StopGeneration);
      // console.log("falsy condition met", inputArea, sendButton);
      break;
  }
}
