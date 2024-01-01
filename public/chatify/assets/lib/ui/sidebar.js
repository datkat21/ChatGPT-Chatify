import { getPrompts } from "../promptHandling.js";
import convoButton from "./sidebar/conversation.js";
import { promptPick } from "./sidebar/promptPick.js";
import settingsBtn from "./sidebar/settings.js";
import requestUi from "./sidebar/requestUi.js";
import { versionCheck } from "./sidebar/versionChecker.js";
import Html from "../../scripts/html.js";
import { ICONS } from "./sidebar/icons.js";
import { store } from "../_globals.js";
import { checkRequests, updateRequestsMessage } from "../apiUsage.js";
import toggleButton from "./sidebar/toggleView.js";
import customSettings from "./sidebar/customSettings.js";

export default async function setupSidebar() {
  // previously called settingsContainer
  const sideBar = new Html().class("config").appendTo("body");

  store.set("sideBar", sideBar);

  const selectWrapper = new Html().class("row").appendTo(sideBar);

  const heading = new Html("span")
    .text("Chatify")
    .classOn("extra-hidden", "label")
    .appendTo(selectWrapper);
  const deleteConvoButton = new Html("button")
    .html(ICONS.trashCan)
    .classOn("center", "danger", "fg-auto")
    .appendTo(selectWrapper)
    .on("click", (_) => clearMessageHistory());

  store.set("deleteConvoButton", deleteConvoButton);

  // Hidden select menu used in the inner workings
  const select = new Html("select")
    .class("fg", "extra-hidden")
    .appendTo(selectWrapper);

  store.set("select", select);

  const prompts = await getPrompts();

  prompts.forEach((e) => {
    select.elm.appendChild(new Option(e.label, e.id));
  });

  select.elm.append(new Option("Custom", "custom"));

  const selectWrapperMiddle = new Html().class("fg").appendTo(selectWrapper);

  // Sidebar menu hide/show button
  toggleButton(selectWrapper);

  // Custom settings UI
  customSettings(sideBar);

  const selectPromptBtn = new Html("button")
    .text("Select prompt..")
    .classOn("transparent", "fg", "w-100")
    .appendTo(selectWrapperMiddle)
    .on("click", async () => {
      await promptPick();
    });
  store.set("selectPromptBtn", selectPromptBtn);

  let userName = localStorage.getItem("remembered-name") ?? "User";

  store.set("userName", userName);

  const multiRow = new Html().classOn("row").appendTo(sideBar);

  // Add multi row buttons
  convoButton(multiRow);
  settingsBtn(multiRow);

  requestUi(sideBar);

  await versionCheck(sideBar);
  await checkRequests();

  updateRequestsMessage();
}
