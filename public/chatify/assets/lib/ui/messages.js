import Html from "../../scripts/html.js";
import { store } from "../_globals.js";
import { ICONS } from "./sidebar/icons.js";
import { startTextGeneration } from "./state.js";

export function autoExpandTextArea(e) {
  const inputArea = store.get("inputArea");

  inputArea.elm.style.height = "auto";
  inputArea.elm.style.height = inputArea.elm.scrollHeight + 2 + "px";

  const inputAreaHeight = inputArea.elm.offsetHeight;
  store.get("messagesContainer").elm.style.paddingBottom = `${
    inputAreaHeight + 12
  }px`;
}

export function setupMessages() {
  const messagesWrapper = new Html().class("messages-wrapper").style({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    alignItems: "flex-end",
  });

  const messagesContainer = new Html()
    .class("messages")
    .appendTo(messagesWrapper);

  store.set("messagesContainer", messagesContainer);

  const inputAreaWrapper = new Html()
    .classOn("row", "py-0", "align-end")
    .appendTo(messagesWrapper);

  const inputArea = new Html("textarea")
    .classOn("fg")
    .attr({ type: "text", placeholder: "Message", rows: "1" })
    .style({ resize: "vertical", "min-height": "34px" })
    .appendTo(inputAreaWrapper);

  inputArea.style({ height: "35px" });

  const sendButton = new Html("button")
    .html(ICONS.send)
    .classOn("fg-auto")
    .appendTo(inputAreaWrapper);

  store.set("sendButton", sendButton);

  messagesWrapper.appendTo("body");

  store.set("messagesWrapper", messagesWrapper);

  inputArea.elm.addEventListener("input", autoExpandTextArea);
  inputArea.elm.addEventListener("change", autoExpandTextArea);
  window.addEventListener("resize", autoExpandTextArea);

  // check if user is on mobile browser
  const isMobile = /Mobi/.test(navigator.userAgent);

  if (!isMobile) {
    inputArea.elm.addEventListener("keydown", (e) => {
      if ((e.code || e.key) === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (e.target.value) {
          startTextGeneration();
        }
      }
    });
  }

  store.set("inputArea", inputArea);
}
