import Html from "../../scripts/html.js";
import { store } from "../_globals.js";
import { checkRequests, updateRequestsMessage } from "../apiUsage.js";
import { callAiMessage } from "../callApi.js";
import Modal from "../modal.js";
import { parseMarkdown, scrollDown } from "../util.js";
import { autoExpandTextArea } from "./messages.js";
import { ICONS } from "./sidebar/icons.js";

let isTyping = false; // This will be true at any point message generation begins
let currentSocket = null;
let hasSetUp = false;

store.set("currentSocket", currentSocket);

export function makeMessage(
  side = 0,
  data,
  messageIndex,
  prompt = null,
  isSystem = false,
  actuallyGoesToMessageHistory = true
) {
  if (messageIndex === undefined)
    messageIndex = store.get("messageHistory").length;
  const msg = new Html().class("message");
  const messageContentWrapper = new Html().class("wrapper").appendTo(msg);
  const icon = new Html().class("icon").appendTo(messageContentWrapper);
  const dataContainer = new Html()
    .class("data", "fg-max")
    .appendTo(messageContentWrapper);
  const extra = new Html().class("column").appendTo(msg);
  const uname = new Html().class("name").appendTo(dataContainer);
  const text = new Html().class("text").appendTo(dataContainer);
  switch (side) {
    case 0:
      msg.class("user");
      dataContainer.class("muted");
      text.html(data);
      if (prompt) {
        uname.text(prompt);
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
        if (store.get('aiAvatarOverride') !== false) {
          icon.style({ "background-image": "url(" + store.get('aiAvatarOverride') + ")" });
        }
        if (store.get('aiNameOverride') !== false) {
          uname.text(store.get('aiNameOverride'));
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
        .on("click", (e) => {
          let modal;
          const modalContainer = new Html()
            .text("Are you sure you want to delete this message?")
            .append(
              new Html()
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", (e) => {
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
                    .on("click", (e) => {
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
        .on("click", (e) => {
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
        .on("click", (e) => {
          let text = store.get("messageHistory")[messageIndex].content;

          const textArea = new Html("textarea")
            .classOn("mt-1")
            .attr({ rows: 8, placeholder: "Message content is empty" })
            .val(text);

          let modal;

          const modalContainer = new Html()
            .text(`Edit Message #${messageIndex}`)
            .appendMany(
              textArea,
              new Html()
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", (e) => {
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
                    .on("click", (e) => {
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
        .on("click", (e) => {
          let modal;
          const modalContainer = new Html()
            .text("Are you sure you want to delete this message?")
            .append(
              new Html()
                .classOn("fg-auto", "row")
                .append(
                  new Html("button")
                    .text("OK")
                    .classOn("fg-auto")
                    .on("click", (e) => {
                      msg.cleanup();
                      modal.hide();
                    })
                )
                .append(
                  new Html("button")
                    .text("Cancel")
                    .classOn("danger", "fg-auto")
                    .on("click", (e) => {
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

export function updateMessage(messageRef, data = null) {
  messageRef.querySelector(".data").classList.remove("muted", "dots-flow");

  if (data !== null) {
    if (data.startsWith('"')) data = data.slice(1);
    if (data.endsWith('"')) data = data.slice(0, -1);
    messageRef.querySelector(".data .text").innerHTML = DOMPurify.sanitize(
      parseMarkdown(data)
    );
  }
}

async function request(text, addUserMessage = true) {
  // message = text;

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
    if (!store.get('loadedCustomPrompt').id) {
      // Something is wrong as we have a custom prompt set but it hasn't filled the custom prompt data
      // return alert(
      //   "Unable to load your request because the custom prompt is not properly set."
      // );
    } else
      store.get("messageHistory")[aiIndex].promptId = store.get('loadedCustomPrompt').id;
  }

  const prompt =
    prompts.find((p) => p.id === store.get("select").elm.value) || prompts[0];

  // console.log(messageHistory[aiIndex], prompt);

  let human;
  if (addUserMessage === true) {
    human = makeMessage(0, DOMPurify.sanitize(parseMarkdown(text)), userIndex);
  }
  let ai = makeMessage(1, "", aiIndex, prompt);

  isTyping = true;
  updateState();

  // console.log(currentSocket);

  store.get("deleteConvoButton").elm.disabled = true; // Required otherwise bad things happen

  let result = await callAiMessage(
    ai.elm,
    text,
    store.get("messageHistory").slice(0, store.get("messageHistory").length - 1)
  );
  updateMessage(human.elm);
  store.get("messageHistory")[aiIndex].content = result;

  isTyping = false;
  updateState();
  store.get("deleteConvoButton").elm.disabled = false;

  await checkRequests();
  updateRequestsMessage();
}

const b4UnloadHandler = (event) => {
  (event || window.event).returnValue = null;
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
