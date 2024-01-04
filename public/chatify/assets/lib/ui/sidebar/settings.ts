import Html from "@datkat21/html";
import { store } from "../../_globals.js";
import Modal from "../../modal.js";

export interface UserSettings {
  promptPrefix: string | false;
  promptPrefixEnabled: boolean;
  timeZone: string | false;
  theme: string;
  username: string;
  includeUsername: boolean;
  rememberContext: boolean;
  chatViewType: string;
  showAvatars: boolean;
  showNames: boolean;
  showCopyButton: boolean;
  showEditButton: boolean;
  testMode: boolean;
  ctxLength: string;
  maxTokens: string;
}

let userSettings: UserSettings = {
  promptPrefix: "", // string | false, if 0 char is false
  promptPrefixEnabled: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || false,
  theme: "clean-dark",
  username: "User",
  includeUsername: false,
  rememberContext: false,
  chatViewType: "cozy",
  showAvatars: true,
  showNames: true,
  showCopyButton: true,
  showEditButton: true,
  testMode: false,
  ctxLength: "3072",
  maxTokens: "2048",
};

store.set("userSettings", userSettings);

export function loadUserSettings(
  us = JSON.parse(localStorage.getItem("user-settings") || "{}")
) {
  try {
    const userSettings = store.get("userSettings");
    if (us.promptPrefix !== undefined)
      userSettings["promptPrefix"] = us.promptPrefix;
    if (us.promptPrefixEnabled !== undefined)
      userSettings["promptPrefixEnabled"] = us.promptPrefixEnabled;
    if (us.timeZone !== undefined) userSettings["timeZone"] = us.timeZone;
    if (us.theme !== undefined) userSettings["theme"] = us.theme;
    if (us.username !== undefined) userSettings["username"] = us.username;
    if (us.includeUsername !== undefined)
      userSettings["includeUsername"] = us.includeUsername;
    if (us.chatViewType !== undefined)
      userSettings["chatViewType"] = us.chatViewType;
    if (us.showAvatars !== undefined)
      userSettings["showAvatars"] = us.showAvatars;
    if (us.showNames !== undefined) userSettings["showNames"] = us.showNames;
    if (us.showCopyButton !== undefined)
      userSettings["showCopyButton"] = us.showCopyButton;
    if (us.showEditButton !== undefined)
      userSettings["showEditButton"] = us.showEditButton;
    if (us.testMode !== undefined) userSettings["testMode"] = us.testMode;
    if (us.ctxLength !== undefined) userSettings["ctxLength"] = us.ctxLength;
    if (us.maxTokens !== undefined) userSettings["maxTokens"] = us.maxTokens;

    // Update old settings 'clean-dark' -> 'azure'
    if (userSettings.theme !== undefined && userSettings.theme === "clean-dark")
      userSettings.theme = "azure";
    // Update old settings promptPrefix = false -> promptPrefix = ''
    if (us.promptPrefix === false) userSettings["promptPrefix"] = "";

    document.documentElement.dataset.theme = userSettings.theme;
    document.documentElement.dataset.chatViewType = userSettings.chatViewType;

    document.documentElement.dataset.showAvatars = userSettings.showAvatars;
    document.documentElement.dataset.showNames = userSettings.showNames;
    document.documentElement.dataset.showCopyButton =
      userSettings.showCopyButton;
  } catch (e) {}
}

loadUserSettings();

// Function to save the current user settings to local storage
function saveUserSettings() {
  localStorage.setItem("user-settings", JSON.stringify(userSettings));
}

export default function settingsBtn(container: Html) {
  return new Html("button")
    .text("Settings")
    .class("fg")
    .appendTo(container)
    .on("click", () => {
      const manageSettingsDiv = new Html("div").class("row");

      const importSettingsBtn = new Html("button")
        .class("fg-auto")
        .text("Import Settings");
      const exportSettingsBtn = new Html("button")
        .class("fg-auto")
        .text("Export Settings");

      importSettingsBtn.on("click", () => {
        let modal1: Modal;
        const modalContainer = new Html("div")
          .text(
            "Are you sure you want to continue importing new settings?\nYou will lose ALL your prompts and saved settings."
          )
          .append(
            new Html("div")
              .classOn("fg-auto", "row")
              .append(
                new Html("button")
                  .text("OK")
                  .classOn("danger", "fg-auto")
                  .on("click", () => {
                    modal1.hide();

                    const ta = new Html("textarea").attr({
                      rows: "8",
                      placeholder: "{ ... }",
                    });

                    const modalContent = new Html("div")
                      .text("Import JSON configuration data:")
                      .append(
                        new Html("div").classOn("column").appendMany(
                          ta,
                          new Html("button")
                            .text("Attempt Import")
                            .classOn("fg-auto")
                            .on("click", () => {
                              let json;
                              try {
                                json = JSON.parse(ta.getValue());
                                loadUserSettings(json);
                                if (typeof json["promptList"] !== "undefined") {
                                  // a bit of a lazy one
                                  localStorage.setItem(
                                    "prompts",
                                    JSON.stringify(json["promptList"])
                                  );
                                }
                                modal2.hide();

                                // another lazy
                                modal.hide();
                                store.get("userSettingsBtn").elm.click();
                                saveUserSettings();
                              } catch (e) {
                                modal2.hide();
                              }
                              // modal2.hide();
                            })
                        )
                      );

                    const modal2 = new Modal(modalContent);
                    modal2.show();
                  })
              )
              .append(
                new Html("button")
                  .text("Cancel")
                  .classOn("fg-auto")
                  .on("click", () => {
                    modal1.hide();
                  })
              )
          );

        modal1 = new Modal(modalContainer);
        modal1.show();
      });

      exportSettingsBtn.on("click", () => {
        const ta = new Html("textarea").attr({
          rows: "8",
          placeholder: "{ ... }",
        });

        let modalContent;

        try {
          ta.val(
            JSON.stringify(
              Object.assign(
                JSON.parse(localStorage.getItem("user-settings") || "{}"),
                {
                  promptList: JSON.parse(
                    localStorage.getItem("prompts") || "{}"
                  ),
                }
              )
            )
          );

          modalContent = new Html("div")
            .text("Here's your exported configuration data:")
            .append(
              new Html("div").classOn("column").appendMany(
                ta,
                new Html("button")
                  .text("OK")
                  .classOn("fg-auto")
                  .on("click", () => {
                    modal2.hide();
                  })
              )
            );
        } catch (e) {
          modalContent = new Html("div")
            .text("Unable to export configuration due to parsing error:\n" + e)
            .append(
              new Html("div").classOn("column").appendMany(
                new Html("button")
                  .text("OK")
                  .classOn("fg-auto")
                  .on("click", () => {
                    modal2.hide();
                  })
              )
            );
        }

        const modal2 = new Modal(modalContent);
        modal2.show();
      });

      manageSettingsDiv.appendMany(importSettingsBtn, exportSettingsBtn);

      // User name input
      const usernameInput = new Html("input")
        .attr({
          type: "text",
          placeholder: "Username",
          maxlength: "24",
          minlength: "1",
        })
        .on("input", (e: Event) => {
          localStorage.setItem("remembered-name", usernameInput.getValue());
          const result = /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.getValue());
          store.set(
            "userName",
            result === true ? usernameInput.getValue() : "user"
          );
          userSettings.username = store.get("userName");
          saveUserSettings();
          if (result === false)
            return ((e.target as HTMLInputElement).value = "User");
        });

      store.set("usernameInput", usernameInput);

      usernameInput.val(localStorage.getItem("remembered-name") ?? "User");
      store.set(
        "userName",
        /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.getValue())
          ? usernameInput.getValue()
          : "user"
      );

      // Checkboxes
      const settings_extraContentWrapper = new Html("span");

      const settings_enableUserNameWrapper = new Html("span")
        .appendTo(settings_extraContentWrapper)
        .classOn("row");

      const settings_enableUserName = new Html("input")
        .attr({
          id: "u",
          type: "checkbox",
          checked: userSettings.includeUsername === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          userSettings.includeUsername = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_enableUserNameWrapper);
      new Html("label")
        .attr({
          for: "u",
        })
        .text("Include username?")
        .appendTo(settings_enableUserNameWrapper);

      const settings_rememberContextWrapper = new Html("span")
        .appendTo(settings_extraContentWrapper)
        .classOn("row", "pt-0", "pb-0");

      const settings_rememberContextCheckbox = new Html("input")
        .attr({
          id: "rcc",
          type: "checkbox",
          checked: userSettings.rememberContext === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          userSettings.rememberContext = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_rememberContextWrapper);
      new Html("label")
        .attr({
          for: "rcc",
        })
        .text("Experimental: Remember context better")
        .appendTo(settings_rememberContextWrapper);

      // Appearance checkboxes

      // Checkboxes
      const settings_AppearanceContentWrapper = new Html("span");

      const settings_showAvatarsWrapper = new Html("span")
        .appendTo(settings_AppearanceContentWrapper)
        .classOn("row");

      const settings_showAvatarsCheckbox = new Html("input")
        .attr({
          id: "sha",
          type: "checkbox",
          checked: userSettings.showAvatars === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          document.documentElement.dataset.showAvatars = String(
            (e.target as HTMLInputElement).checked
          );
          userSettings.showAvatars = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_showAvatarsWrapper);
      new Html("label")
        .attr({
          for: "sha",
        })
        .text("Show avatars next to messages")
        .appendTo(settings_showAvatarsWrapper);

      const settings_showNamesWrapper = new Html("span")
        .appendTo(settings_AppearanceContentWrapper)
        .classOn("row", "pt-0");

      const settings_showNamesCheckbox = new Html("input")
        .attr({
          id: "shn",
          type: "checkbox",
          checked: userSettings.showNames === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          document.documentElement.dataset.showNames = String(
            (e.target as HTMLInputElement).checked
          );
          userSettings.showNames = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_showNamesWrapper);
      new Html("label")
        .attr({
          for: "shn",
        })
        .text("Show names next to messages")
        .appendTo(settings_showNamesWrapper);

      const settings_showCopyBtnWrapper = new Html("span")
        .appendTo(settings_AppearanceContentWrapper)
        .classOn("row", "pt-0");

      const settings_showCopyBtnCheckbox = new Html("input")
        .attr({
          id: "shc",
          type: "checkbox",
          checked: userSettings.showCopyButton === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          document.documentElement.dataset.showCopyButton = String(
            (e.target as HTMLInputElement).checked
          );
          userSettings.showCopyButton = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_showCopyBtnWrapper);
      new Html("label")
        .attr({
          for: "shc",
        })
        .text("Show 'Copy' button next to messages")
        .appendTo(settings_showCopyBtnWrapper);

      const settings_showEditButtonWrapper = new Html("span")
        .appendTo(settings_AppearanceContentWrapper)
        .classOn("row", "pt-0", "pb-0");

      const settings_showEditButtonCheckbox = new Html("input")
        .attr({
          id: "she",
          type: "checkbox",
          checked: userSettings.showEditButton === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          document.documentElement.dataset.showEditButton = String(
            (e.target as HTMLInputElement).checked
          );
          userSettings.showEditButton = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_showEditButtonWrapper);
      new Html("label")
        .attr({
          for: "she",
        })
        .text("Show 'Edit' button next to messages")
        .appendTo(settings_showEditButtonWrapper);

      const settings_ChatbotSettingsContentWrapper = new Html("span");

      const settings_testModeWrapper = new Html("span")
        .appendTo(settings_ChatbotSettingsContentWrapper)
        .class("pb-0")
        .classOn("row");

      const settings_testModeCheckbox = new Html("input")
        .attr({
          id: "tem",
          type: "checkbox",
          checked: userSettings.testMode === true ? true : undefined,
        })
        .on("input", (e: Event) => {
          userSettings.testMode = (e.target as HTMLInputElement).checked;
          saveUserSettings();
        })
        .appendTo(settings_testModeWrapper);
      new Html("label")
        .attr({
          for: "tem",
        })
        .text("Enable Test Mode (fake responses for debugging)")
        .appendTo(settings_testModeWrapper);

      const themeSelect = new Html("select")
        .appendMany(
          new Html("option").text("Dark").attr({
            value: "dark",
            selected: userSettings.theme === "dark" ? true : undefined,
          }),
          new Html("option").text("Light").attr({
            value: "light",
            selected: userSettings.theme === "light" ? true : undefined,
          }),
          new Html("option").text("Midnight").attr({
            value: "amoled",
            selected: userSettings.theme === "amoled" ? true : undefined,
          }),
          new Html("option").text("Lavender").attr({
            value: "lavender",
            selected: userSettings.theme === "lavender" ? true : undefined,
          }),
          new Html("option").text("Maroon").attr({
            value: "maroon",
            selected: userSettings.theme === "maroon" ? true : undefined,
          }),
          new Html("option").text("Tangerine").attr({
            value: "tangerine",
            selected: userSettings.theme === "tangerine" ? true : undefined,
          }),
          new Html("option").text("Lemon").attr({
            value: "lemon",
            selected: userSettings.theme === "lemon" ? true : undefined,
          }),
          new Html("option").text("Forest").attr({
            value: "forest",
            selected: userSettings.theme === "forest" ? true : undefined,
          }),
          new Html("option").text("Azure").attr({
            value: "azure",
            selected: userSettings.theme === "azure" ? true : undefined,
          }),
          new Html("option").text("Orchid").attr({
            value: "orchid",
            selected: userSettings.theme === "orchid" ? true : undefined,
          }),
          new Html("option").text("Violet").attr({
            value: "violet",
            selected: userSettings.theme === "violet" ? true : undefined,
          })
        )
        .on("input", (e: Event) => {
          document.documentElement.dataset.theme = String(
            (e.target as HTMLInputElement).value
          );
          userSettings.theme = (e.target as HTMLInputElement).value;
          saveUserSettings();
        });
      const chatSelect = new Html("select")
        .appendMany(
          new Html("option").text("Cozy (default)").attr({
            value: "cozy",
            selected: userSettings.chatViewType === "cozy" ? true : undefined,
          }),
          new Html("option").text("Compact").attr({
            value: "compact",
            selected:
              userSettings.chatViewType === "compact" ? true : undefined,
          }),
          new Html("option").text("Bubbles").attr({
            value: "bubbles",
            selected:
              userSettings.chatViewType === "bubbles" ? true : undefined,
          }),
          new Html("option").text("Flat Bubbles").attr({
            value: "flat-bubbles",
            selected:
              userSettings.chatViewType === "flat-bubbles" ? true : undefined,
          })
        )
        .on("input", (e: Event) => {
          document.documentElement.dataset.chatViewType = (
            e.target as HTMLInputElement
          ).value;
          userSettings.chatViewType = (e.target as HTMLInputElement).value;
          saveUserSettings();
        });

      const settings_togglePromptPrefixWrapper = new Html("span")
        .appendTo(settings_ChatbotSettingsContentWrapper)
        .classOn("row");

      function togglePpReadonly() {
        if (
          !(settings_togglePromptPrefixCheckbox.elm as HTMLInputElement).checked
        ) {
          (promptPrefixBox.elm as HTMLInputElement).disabled = true;
        } else {
          (promptPrefixBox.elm as HTMLInputElement).disabled = false;
        }
      }

      const settings_togglePromptPrefixCheckbox = new Html("input")
        .attr({
          id: "epp",
          type: "checkbox",
          checked: userSettings.promptPrefixEnabled === true ? true : "",
        })
        .on("input", (e: Event) => {
          userSettings.promptPrefixEnabled = (
            e.target as HTMLInputElement
          ).checked;
          togglePpReadonly();
          saveUserSettings();
        })
        .appendTo(settings_togglePromptPrefixWrapper);
      new Html("label")
        .attr({
          for: "epp",
        })
        .text("Enable prompt prefix")
        .appendTo(settings_togglePromptPrefixWrapper);

      const promptPrefixBox = new Html("textarea")
        .attr({ rows: "4", placeholder: "<none>", resize: "none" })
        .html(
          userSettings.promptPrefix !== false ? userSettings.promptPrefix : ""
        )
        .on("input", (e: Event) => {
          userSettings.promptPrefix =
            (e.target as HTMLInputElement).value.length > 0
              ? (e.target as HTMLInputElement).value
              : false;
          saveUserSettings();
        });

      togglePpReadonly();

      const ctxLength = new Html("select")
        .appendMany(
          new Html("option").text("25").attr({
            value: "25",
            selected: userSettings.ctxLength === "25" ? true : undefined,
          }),
          new Html("option").text("32").attr({
            value: "32",
            selected: userSettings.ctxLength === "32" ? true : undefined,
          }),
          new Html("option").text("64").attr({
            value: "64",
            selected: userSettings.ctxLength === "64" ? true : undefined,
          }),
          new Html("option").text("128").attr({
            value: "128",
            selected: userSettings.ctxLength === "128" ? true : undefined,
          }),
          new Html("option").text("256").attr({
            value: "256",
            selected: userSettings.ctxLength === "256" ? true : undefined,
          }),
          new Html("option").text("512").attr({
            value: "512",
            selected: userSettings.ctxLength === "512" ? true : undefined,
          }),
          new Html("option").text("1024").attr({
            value: "1024",
            selected: userSettings.ctxLength === "1024" ? true : undefined,
          }),
          new Html("option").text("2048").attr({
            value: "2048",
            selected: userSettings.ctxLength === "2048" ? true : undefined,
          }),
          new Html("option").text("2500").attr({
            value: "2500",
            selected: userSettings.ctxLength === "2500" ? true : undefined,
          }),
          new Html("option").text("2750").attr({
            value: "2750",
            selected: userSettings.ctxLength === "2750" ? true : undefined,
          }),
          new Html("option").text("3072").attr({
            value: "3072",
            selected: userSettings.ctxLength === "3072" ? true : undefined,
          })
        )
        .on("input", (e: Event) => {
          userSettings.ctxLength = (e.target as HTMLInputElement).value;
          saveUserSettings();
        });

      const maxTokens = new Html("select")
        .appendMany(
          new Html("option").text("25").attr({
            value: "25",
            selected: userSettings.maxTokens === "25" ? true : undefined,
          }),
          new Html("option").text("32").attr({
            value: "32",
            selected: userSettings.maxTokens === "32" ? true : undefined,
          }),
          new Html("option").text("64").attr({
            value: "64",
            selected: userSettings.maxTokens === "64" ? true : undefined,
          }),
          new Html("option").text("128").attr({
            value: "128",
            selected: userSettings.maxTokens === "128" ? true : undefined,
          }),
          new Html("option").text("256").attr({
            value: "256",
            selected: userSettings.maxTokens === "256" ? true : undefined,
          }),
          new Html("option").text("512").attr({
            value: "512",
            selected: userSettings.maxTokens === "512" ? true : undefined,
          }),
          new Html("option").text("1024").attr({
            value: "1024",
            selected: userSettings.maxTokens === "1024" ? true : undefined,
          }),
          new Html("option").text("2048").attr({
            value: "2048",
            selected: userSettings.maxTokens === "2048" ? true : undefined,
          })
        )
        .on("input", (e: Event) => {
          userSettings.maxTokens = (e.target as HTMLInputElement).value;
          saveUserSettings();
        });

      const modalContent = new Html("div")
        .classOn("col")
        .appendMany(
          manageSettingsDiv,
          new Html("fieldset").appendMany(
            new Html("legend").text("Personalization"),
            new Html("span").classOn("pb-2", "flex", "title").text("Username"),
            usernameInput,
            settings_extraContentWrapper
          ),
          new Html("fieldset").appendMany(
            new Html("legend").text("Appearance"),
            new Html("span").classOn("pb-2", "flex", "title").text("Theme"),
            themeSelect,
            new Html("span")
              .classOn("pb-2", "pt-2", "flex", "title")
              .text("Chat Style"),
            chatSelect,
            new Html("span")
              .classOn("pt-2", "flex", "title")
              .text("Optional Appearance Features"),
            settings_AppearanceContentWrapper
          ),
          new Html("fieldset").appendMany(
            new Html("legend").text("Chatbot Settings"),
            settings_togglePromptPrefixWrapper,
            new Html("span")
              .classOn("pb-2", "flex", "title")
              .text("Prompt prefix"),
            promptPrefixBox,
            new Html("span")
              .classOn("pt-2", "pb-2", "flex", "title")
              .text("Context Length (in tokens)"),
            ctxLength,
            new Html("span")
              .classOn("pt-2", "pb-2", "flex", "title")
              .text("Max Tokens (to generate)"),
            maxTokens,
            new Html("span").classOn("pt-2", "flex", "title").text("Test Mode"),
            settings_ChatbotSettingsContentWrapper
          )
        );

      store.set("settings_enableUserName", settings_enableUserName);
      store.set(
        "settings_rememberContextCheckbox",
        settings_rememberContextCheckbox
      );
      store.set("themeSelect", themeSelect);
      store.set("settings_showAvatarsCheckbox", settings_showAvatarsCheckbox);
      store.set("settings_showNamesCheckbox", settings_showNamesCheckbox);
      store.set("settings_showCopyBtnCheckbox", settings_showCopyBtnCheckbox);
      store.set(
        "settings_showEditButtonCheckbox",
        settings_showEditButtonCheckbox
      );
      store.set("chatSelect", chatSelect);
      store.set(
        "settings_togglePromptPrefixCheckbox",
        settings_togglePromptPrefixCheckbox
      );
      store.set("togglePpReadonly", togglePpReadonly);
      store.set("promptPrefixBox", promptPrefixBox);
      store.set("ctxLength", ctxLength);
      store.set("maxTokens", maxTokens);
      store.set("settings_testModeCheckbox", settings_testModeCheckbox);

      // Show the settings modal
      const modal = new Modal(modalContent);
      modal.show();
    });
}
