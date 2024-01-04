import { store } from "./_globals";
import { loadUserSettings } from "./ui/sidebar/settings";
import { request } from "./ui/state";

export default function settingsListener() {
  window.addEventListener("storage", (e) => {
    loadUserSettings();
    window.dispatchEvent(
      new CustomEvent("chatify-settings-update", {
        detail: { data: e.newValue },
      })
    );
  });

  window.addEventListener("chatify-settings-update", function (e) {
    // Personalization
    store.get("usernameInput").elm.value = store.get("userSettings").username;
    store.get("settings_enableUserName").elm.checked =
      store.get("userSettings").includeUsername;
    store.get("settings_rememberContextCheckbox").elm.checked =
      store.get("userSettings").rememberContext;
    // Appearance
    store.get("themeSelect").elm.value = store.get("userSettings").theme;
    store.get("settings_showAvatarsCheckbox").elm.checked =
      store.get("userSettings").showAvatars;
    store.get("settings_showNamesCheckbox").elm.checked =
      store.get("userSettings").showNames;
    store.get("settings_showCopyBtnCheckbox").elm.checked =
      store.get("userSettings").showCopyButton;
    store.get("settings_showEditButtonCheckbox").elm.checked =
      store.get("userSettings").showEditButton;
    document.documentElement.dataset.showEditButton =
      store.get("userSettings").showEditButton;
    store.get("chatSelect").elm.value = store.get("userSettings").chatViewType;
    // Chatbot Settings
    store.get("settings_togglePromptPrefixCheckbox").elm.checked =
      store.get("userSettings").promptPrefixEnabled;
    store.get("togglePpReadonly")();
    store.get("promptPrefixBox").elm.value =
      store.get("userSettings").promptPrefix;
    store.get("ctxLength").elm.value = store.get("userSettings").ctxLength;
    store.get("maxTokens").elm.value = store.get("userSettings").maxTokens;
    store.get("settings_testModeCheckbox").elm.checked =
      store.get("userSettings").testMode;
  });

  // misc event used to call message in some cases
  window.addEventListener("chatify-message-request", async (e: any) => {
    if (e.detail.history && e.detail.history === "remove") {
      store.set("messageHistory", []);
    }
    await request(e.detail.data, false);
  });
}
