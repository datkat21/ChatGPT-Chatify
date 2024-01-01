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
    usernameInput.elm.value = userSettings.username;
    settings_enableUserName.elm.checked = userSettings.includeUsername;
    settings_rememberContextCheckbox.elm.checked = userSettings.rememberContext;
    // Appearance
    themeSelect.elm.value = userSettings.theme;
    settings_showAvatarsCheckbox.elm.checked = userSettings.showAvatars;
    settings_showNamesCheckbox.elm.checked = userSettings.showNames;
    settings_showCopyBtnCheckbox.elm.checked = userSettings.showCopyButton;
    settings_showEditButtonCheckbox.elm.checked = userSettings.showEditButton;
    document.documentElement.dataset.showEditButton =
      userSettings.showEditButton;
    chatSelect.elm.value = userSettings.chatViewType;
    // Chatbot Settings
    settings_togglePromptPrefixCheckbox.elm.checked =
      userSettings.promptPrefixEnabled;
    togglePpReadonly();
    promptPrefixBox.elm.value = userSettings.promptPrefix;
    ctxLength.elm.value = userSettings.ctxLength;
    maxTokens.elm.value = userSettings.maxTokens;
    settings_testModeCheckbox.elm.checked = userSettings.testMode;
  });

  // misc event used to call message in some cases
  window.addEventListener("chatify-message-request", async (e) => {
    if (e.detail.history && e.detail.history === "remove") {
      messageHistory = [];
    }
    await request(e.detail.data, false);
  });
}
