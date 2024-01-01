import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";
import { ICONS } from "./icons.js";

export default function toggleButton(selectWrapper) {
  const toggleBtn = new Html("button")
    .html(ICONS.chevron)
    .class("fg-auto", "flip-off")
    .appendTo(selectWrapper);

  toggleBtn.on("click", () => {
    if (store.get("menuState") === true) {
      store.set("menuState", false);
      toggleBtn.classOff("flip-off");
      toggleBtn.classOn("flip");
      customSettingsWrapper.classOn("extra-hidden");
      convoManageButton.classOn("extra-hidden");
      userSettingsBtn.classOn("extra-hidden");
      requestUi_wrapper.classOn("extra-hidden");
      heading.classOff("extra-hidden");
      multiRow.classOn("extra-hidden");
      deleteConvoButton.classOn("extra-hidden");
      toggleBtn.style({ "margin-left": "auto" });
      store.get("selectPromptBtn").classOn("extra-hidden");
      store.get("debugVersionNumber").classOn("extra-hidden");
      store.get("sideBar").classOn("mw-0");
    } else if (store.get("menuState") === false) {
      store.set("menuState", true);
      toggleBtn.classOff("flip");
      toggleBtn.classOn("flip-off"); // mobile
      multiRow.classOff("extra-hidden");
      customSettingsWrapper.classOff("extra-hidden");
      convoManageButton.classOff("extra-hidden");
      userSettingsBtn.classOff("extra-hidden");
      requestUi_wrapper.classOff("extra-hidden");
      heading.classOn("extra-hidden");
      deleteConvoButton.classOff("extra-hidden");
      toggleBtn.style({ "margin-left": "unset" });
      store.get("selectPromptBtn").classOff("extra-hidden");
      store.get("debugVersionNumber").classOff("extra-hidden");
      store.get("sideBar").classOff("mw-0");
    }
  });
}
