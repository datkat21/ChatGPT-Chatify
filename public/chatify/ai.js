window.addEventListener("load", async function () {
  //#region Setup
  class Html {
    constructor(e) {
      this.elm = document.createElement(e || "div");
    }
    text(val) {
      this.elm.innerText = val;
      return this;
    }
    html(val) {
      this.elm.innerHTML = val;
      return this;
    }
    cleanup() {
      this.elm.remove();
    }
    query(selector) {
      return this.elm.querySelector(selector);
    }
    class(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.toggle(val[i]);
      }
      return this;
    }
    classOn(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.add(val[i]);
      }
      return this;
    }
    classOff(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.remove(val[i]);
      }
      return this;
    }
    style(obj) {
      for (const key of Object.keys(obj)) {
        this.elm.style.setProperty(key, obj[key]);
      }
      return this;
    }
    on(ev, cb) {
      this.elm.addEventListener(ev, cb);
      return this;
    }
    un(ev, cb) {
      this.elm.removeEventListener(ev, cb);
      return this;
    }
    appendTo(parent) {
      if (parent instanceof HTMLElement) {
        parent.appendChild(this.elm);
      } else if (parent instanceof Html) {
        parent.elm.appendChild(this.elm);
      } else if (typeof parent === "string") {
        document.querySelector(parent).appendChild(this.elm);
      }
      return this;
    }
    append(elem) {
      if (elem instanceof HTMLElement) {
        this.elm.appendChild(elem);
      } else if (elem instanceof Html) {
        this.elm.appendChild(elem.elm);
      } else if (typeof elem === "string") {
        const newElem = document.createElement(elem);
        this.elm.appendChild(newElem);
        return new Html(newElem);
      }
      return this;
    }
    appendMany(...elements) {
      for (const elem of elements) {
        this.append(elem);
      }
      return this;
    }
    clear() {
      this.elm.innerHTML = "";
      return this;
    }
    attr(obj) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === undefined) {
            this.elm.removeAttribute(key);
          } else {
            this.elm.setAttribute(key, obj[key]);
          }
        }
      }
      return this;
    }
  }
  class Modal {
    constructor(content) {
      this.modal = new Html("div");
      this.modal.class("modal");
      this.modal.attr({ "aria-modal": "true", role: "dialog" });

      this.content = new Html("div");
      this.content.class("modal-content");
      this.content.appendTo(this.modal);

      if (typeof content === "string") {
        this.content.html(content);
      } else if (content instanceof HTMLElement) {
        this.content.append(content);
      } else if (content instanceof Html) {
        this.content.append(content.elm);
      }

      this.closeBtn = new Html("button");
      this.closeBtn.class("close-btn", "transparent");
      this.closeBtn.text("x");
      this.closeBtn.attr({ type: "button" });
      this.closeBtn.on("click", this.hide.bind(this));
      this.closeBtn.appendTo(this.content);

      this.overlay = new Html("div");
      this.overlay.class("modal-overlay");
      this.overlay.appendTo(this.modal);

      this.modal.on("keydown", (e) => {
        this.handleKeyDown(e);
      });

      const focusableElements = this.content.elm.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="checkbox"], input[type="radio"], select'
      );
      this.elementsArray = Array.prototype.slice.call(focusableElements);
      this.elementsArray.forEach((el) => {
        el.setAttribute("tabindex", "0");
      });

      this.elementsArray[0].addEventListener("keydown", (e) => {
        if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          this.elementsArray[this.elementsArray.length - 1].focus();
        }
      });
      this.elementsArray[this.elementsArray.length - 1].addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            this.elementsArray[0].focus();
          }
        }
      );
      this.elementsArray[0].focus();
    }

    show() {
      this.modal.appendTo("body");
      this.modal.elm.focus();
      this.elementsArray[0].focus();
    }

    hide() {
      this.modal.cleanup();
    }

    handleKeyDown(e) {
      if (e.key === "Escape") {
        this.hide();
      }
    }
  }

  function colorContrast(color) {
    l = (c) => {
      h = (c) => {
        if (c.length === 3)
          c =
            c.charAt(0) +
            c.charAt(0) +
            c.charAt(1) +
            c.charAt(1) +
            c.charAt(2) +
            c.charAt(2);
        else if (c.length !== 6) throw "Invalid hex color: " + c;
        var r = [];
        for (var i = 0; i <= 2; i++) r[i] = parseInt(c.substr(i * 2, 2), 16);
        return r;
      };
      var r = typeof c === "string" ? h(c) : c;
      return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
    };
    return l(color) >= 165 ? "000" : "fff";
  }

  function toSnakeCase(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function saveAssistant(id, obj) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    prompts[id] = obj;
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }
  function loadAssistant(id = null) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    if (id === null) {
      return prompts;
    } else {
      return prompts[id];
    }
  }
  function deleteAssistant(id) {
    let prompts = {};
    try {
      prompts = JSON.parse(localStorage.getItem("prompts")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    delete prompts[id];
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }

  function saveConvo(id, obj) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing prompts from localStorage!");
    }
    convos[id] = obj;
    localStorage.setItem("convos", JSON.stringify(convos));
  }
  function loadConvo(id = null) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing convos from localStorage!");
    }
    if (id === null) {
      return convos;
    } else {
      return convos[id];
    }
  }
  function deleteConvo(id) {
    let convos = {};
    try {
      convos = JSON.parse(localStorage.getItem("convos")) || {};
    } catch (e) {
      alert("Error parsing convos from localStorage!");
    }
    delete convos[id];
    localStorage.setItem("convos", JSON.stringify(convos));
  }

  function importAndLoadPrompt(value, cb) {
    try {
      const r = JSON.parse(value);
      if (r.system && r.temp) {
        if (r.name === undefined) r.name = false;
        if (r.avatar === undefined) r.avatar = false;
        customSettings_systemPrompt.elm.value = r.system;
        customSettings_temp.elm.value = r.temp;
        aiNameOverride = r.name;
        aiAvatarOverride = r.avatar;
        customSettings_overrideName.elm.value = aiNameOverride;
        customSettings_overrideAvatar.elm.value = aiAvatarOverride;
        cb();
      } else {
        cb();
        const btn_modalContent = new Html("div").text(
          'Something may be wrong with the prompt, please make sure it is a valid JSON object with "system" and "temp".'
        );

        const btn_modal = new Modal(btn_modalContent);
        btn_modal.show();
      }
    } catch (e) {
      cb();
      const btn_modalContent = new Html("div").html(
        "Failed to load prompt. Please make sure it is a valid JSON string!<br>Error code: " +
          e
      );

      const btn_modal = new Modal(btn_modalContent);
      btn_modal.show();
    }
  }
  //#endregion

  const ICONS = {
    trashCan:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    chevron:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    checkMark:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    stop: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    retry:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  };

  let apiUsage = {
    used: 0,
    remaining: 0,
    total: 0,
    expires: "",
    plan: "free",
  };

  async function checkRequests() {
    await this.fetch("/api/usage")
      .then((j) => j.json())
      .then((j) => {
        apiUsage = j;
      });
  }

  await checkRequests();

  let lastScrollTop = -1;
  let lastScrollHeight = -1;

  const OPENAI_URL_WS = `${location.protocol.replace("http", "ws")}//${
    location.host
  }`;
  let messageHistory = [];

  const settingsContainer = new Html().class("config").appendTo("body");
  const messagesWrapper = new Html().class("messages-wrapper").style({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    alignItems: "flex-end",
  });

  const messagesContainer = new Html()
    .class("messages")
    .appendTo(messagesWrapper);

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

  messagesWrapper.appendTo("body");

  messagesWrapper.appendTo("body");

  const selectWrapper = new Html().class("row").appendTo(settingsContainer);

  makeMsgSeparator("Your conversation begins here.");

  function actuallyClearMessageHistory() {
    messageHistory = [];
    messagesContainer.html("");
    makeMsgSeparator("Your conversation begins here.");
  }

  function clearMessageHistory() {
    if (confirm("Are you sure you want to clear your history?")) {
      try {
        sendButton_StopGeneration();
      } catch {}
      actuallyClearMessageHistory();
    }
  }

  const heading = new Html("span")
    .text("Chatify")
    .classOn("extra-hidden", "label")
    .appendTo(selectWrapper);
  const deleteConvoButton = new Html("button")
    .html(ICONS.trashCan)
    .classOn("center", "danger", "fg-auto")
    .appendTo(selectWrapper)
    .on("click", (_) => clearMessageHistory());

  const select = new Html("select")
    .class("fg", "extra-hidden")
    .appendTo(selectWrapper);
  const selectWrapperMiddle = new Html().class("fg").appendTo(selectWrapper);
  const toggleBtn = new Html("button")
    .html(ICONS.chevron)
    .class("fg-auto", "flip-off")
    .appendTo(selectWrapper);

  let menuState = true;

  toggleBtn.on("click", () => {
    if (menuState === true) {
      menuState = false;
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
      selectPromptBtn.classOn("extra-hidden");
      debugVersionNumber.classOn("extra-hidden");
      settingsContainer.classOn("mw-0");
    } else if (menuState === false) {
      menuState = true;
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
      selectPromptBtn.classOff("extra-hidden");
      debugVersionNumber.classOff("extra-hidden");
      settingsContainer.classOff("mw-0");
    }
  });

  let userSettings = {
    promptPrefix: "", // string | false, if 0 char is false
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || false,
    theme: "clean-dark",
    username: "User",
    includeUsername: false,
    rememberContext: false,
    chatViewType: "cozy",
    showAvatars: true,
    showNames: true,
  };

  function loadUserSettings() {
    try {
      let us = JSON.parse(localStorage.getItem("user-settings"));

      if (us.promptPrefix !== undefined)
        userSettings["promptPrefix"] = us.promptPrefix;
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

      // Update old settings 'clean-dark' -> 'azure'
      if (
        userSettings.theme !== undefined &&
        userSettings.theme === "clean-dark"
      )
        userSettings.theme = "azure";

      document.documentElement.dataset.theme = userSettings.theme;
      document.documentElement.dataset.chatViewType = userSettings.chatViewType;

      document.documentElement.dataset.showAvatars = userSettings.showAvatars;
      document.documentElement.dataset.showNames = userSettings.showNames;
    } catch (e) {}
  }

  loadUserSettings();

  window.addEventListener("storage", (e) => {
    loadUserSettings();
    window.dispatchEvent(
      new CustomEvent("chatify-settings-update", {
        detail: { data: e.newValue },
      })
    );
  });

  // Function to save the current user settings to local storage
  function saveUserSettings() {
    localStorage.setItem("user-settings", JSON.stringify(userSettings));
  }

  const prompts = await fetch("/api/prompts").then((j) => j.json());

  this.window.prompts = JSON.parse(JSON.stringify(prompts));

  prompts.forEach((e) => {
    select.elm.appendChild(new Option(e.label, e.id));
  });

  select.elm.append(new Option("Custom", "custom"));

  let aiNameOverride = false;
  let aiAvatarOverride = false;

  const customSettingsWrapper = new Html()
    .class("column", "pb-2", "pt-0", "hidden")
    .appendTo(settingsContainer);

  const customSettings_systemPrompt = new Html("textarea")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "System prompt", rows: "4" });
  const customSettings_overrideName = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({ type: "text", placeholder: "Bot Name Override" })
    .on("input", (e) => {
      aiNameOverride = e.target.value;
    });
  const customSettings_overrideAvatar = new Html("input")
    .appendTo(customSettingsWrapper)
    .attr({
      type: "text",
      placeholder: "Avatar Override, ex. https://...png",
    })
    .on("input", (e) => {
      aiAvatarOverride = e.target.value;
    });

  const customSettings_tempWrapper = new Html("span")
    .classOn("row", "py-0")
    .appendTo(customSettingsWrapper);

  const customSettings_buttonsWrapper = new Html("span")
    .classOn("row", "py-0")
    .appendTo(customSettingsWrapper);

  new Html("button")
    .text("Import")
    .classOn("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config from the prompt and import it ..
      const ta = new Html("textarea").attr({ rows: 8, placeholder: "{ ... }" });

      const modalContent = new Html("div").text("Import JSON data:").append(
        new Html().classOn("column").appendMany(
          ta,
          new Html("button")
            .text("Attempt Import")
            .classOn("fg-auto")
            .on("click", (e) => {
              importAndLoadPrompt(ta.elm.value, () => {
                modal.hide();
              });
            })
        )
      );

      const modal = new Modal(modalContent);
      modal.show();
    });
  new Html("button")
    .text("Export")
    .class("fg")
    .appendTo(customSettings_buttonsWrapper)
    .on("click", () => {
      // Take the config and export it
      const modalContent = new Html("div")
        .text("How do you want to export?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("JSON Export")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your exported prompt:")
                  .append(
                    new Html("textarea").attr({ rows: 8 }).html(
                      JSON.stringify({
                        system: customSettings_systemPrompt.elm.value,
                        temp: customSettings_temp.elm.value,
                        avatar: aiAvatarOverride,
                        name: aiNameOverride,
                      })
                    )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              }),
            new Html("button")
              .text("Add to Saved")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();

                const z = loadAssistant();

                const x = aiNameOverride || "prompt-" + z.length;

                const y = toSnakeCase(x);

                if (z[y]) {
                  if (
                    confirm(
                      `Saving this prompt with the same name as "${y}" will forcefully overwrite it.\nAre you sure you want to do this?`
                    ) === true
                  ) {
                    saveAssistant(y, {
                      system: customSettings_systemPrompt.elm.value,
                      temp: customSettings_temp.elm.value,
                      avatar: aiAvatarOverride,
                      name: aiNameOverride,
                    });
                  } else {
                    return;
                  }
                } else {
                  saveAssistant(y, {
                    system: customSettings_systemPrompt.elm.value,
                    temp: customSettings_temp.elm.value,
                    avatar: aiAvatarOverride,
                    name: aiNameOverride,
                  });
                }

                let m = new Html("span").text(
                  "Saved! Open the prompt picker and go to Saved to see your creation."
                );

                let md = new Modal(m);
                md.show();
              })
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });

  new Html("label")
    .attr({ for: "temp" })
    .text("Temperature")
    .appendTo(customSettings_tempWrapper);
  const customSettings_temp = new Html("input")
    .attr({ id: "temp", type: "range", min: "0", max: "1", step: "0.01" })
    .appendTo(customSettings_tempWrapper);

  let userName = localStorage.getItem("remembered-name") ?? "User";

  function setPrompt(prp, mkMsg = true) {
    select.elm.value = prp.id;
    selectPromptBtn.text(prp.label);
    if (select.elm.value === "custom") {
      customSettingsWrapper.classOff("hidden");
    } else {
      customSettingsWrapper.classOn("hidden");
    }

    if (mkMsg === true) {
      // Add a message and separator
      if (prp.greetingMessages && Array.isArray(prp.greetingMessages)) {
        const m =
          prp.greetingMessages[
            Math.floor(Math.random() * prp.greetingMessages.length)
          ];
        const index =
          messageHistory.push({
            role: "assistant",
            clientSide: true,
            type: select.elm.value,
            content: m,
          }) - 1;
        const msg = makeMessage(1, "", index, prp, true);
        let str = "";
        selectPromptBtn.elm.disabled = true;
        let i = 0;
        const update = () => {
          if (i >= m.length) {
            selectPromptBtn.elm.disabled = false;
          } else {
            str += m[i];
            updateMessage(msg.elm, str);
            i++;
            setTimeout(update, Math.floor(Math.random() * 15));
          }
        };
        setTimeout(update, Math.floor(Math.random() * 15));
      }
    }
  }

  const selectPromptBtn = new Html("button")
    .text("Select prompt..")
    .classOn("transparent", "fg", "w-100")
    .appendTo(selectWrapperMiddle)
    .on("click", () => {
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

      function setTabContent(tab, prompts) {
        const promptbox = new Html().classOn("prompt-box");

        promptbox.append(
          new Html("button")
            .text("Create your own prompt")
            .classOn("fg-auto")
            .on("click", (e) => {
              setPrompt({ id: "custom", label: "Custom" });
              modal.hide();
            })
        );

        prompts.forEach((prp) => {
          const i = new Html().classOn("prompt").appendMany(
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
                } else {
                  setPrompt({ id: "custom", label: "Custom" });
                  const z = JSON.stringify(assistantObj[prp.id]);

                  importAndLoadPrompt(z, () => {
                    modal.hide();
                  });
                }
              })
            )
          );
          i.appendTo(promptbox);
        });

        tab.append(promptbox);
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

      setTabContent(
        promptsTab_savedTab,
        Object.keys(assistantObj).map((key) => {
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
        })
      );

      const modalContent = new Html("div")
        .class("fg")
        .append(new Html("span").text("Prompt selection"))
        .append(new Html("div").appendMany(tabsButtons).appendMany(tabsGroup));

      tabTransition(promptsTab_builtInButton, promptsTab_builtInTab);

      const modal = new Modal(modalContent);
      modal.show();
    });

  const multiRow = new Html().classOn("row").appendTo(settingsContainer);

  let convoManageButton = new Html("button")
    .text("Conversation...")
    .class("fg")
    .appendTo(multiRow)
    .on("click", () => {
      const modalContent = new Html("div")
        .text("What do you want to do?")
        .append(
          new Html().classOn("row").appendMany(
            new Html("button")
              .text("Import")
              .classOn("fg-auto")
              .on("click", (e) => {
                // Take the config from the prompt and impot it ..
                const ta = new Html("textarea").attr({
                  rows: 8,
                  placeholder: '[ {"role": ..., "content": ...}, ... ]',
                });
                const modalContent = new Html("div")
                  .text("Import JSON data:")
                  .append(
                    new Html().classOn("column").appendMany(
                      ta,
                      new Html("button")
                        .text("Attempt Import")
                        .classOn("fg-auto")
                        .on("click", (e) => {
                          try {
                            const convo = JSON.parse(ta.elm.value);
                            if (
                              this.confirm(
                                "Are you sure you want to import?\nYou will lose your current conversation if it has not been saved."
                              ) === true
                            ) {
                              md.hide();
                              if (Array.isArray(convo)) {
                                let items = convo.filter((m) => {
                                  if (m !== null && m.content && m.role) {
                                    if (m.role === "assistant") {
                                      if (
                                        m.type === "custom" ||
                                        prompts.find((p) => p.id === m.type) !==
                                          undefined
                                      ) {
                                        return true;
                                      }
                                    } else if (m.role === "user") {
                                      return true;
                                    }
                                    return false;
                                  }
                                });

                                actuallyClearMessageHistory();
                                messageHistory = items;
                                for (let i = 0; i < items.length; i++) {
                                  const item = items[i];
                                  setPrompt(
                                    prompts.find((p) => p.id === item.type) ||
                                      prompts[0],
                                    false
                                  );

                                  const pickedPrompt =
                                    item.role === "assistant"
                                      ? item.type === "custom"
                                        ? {
                                            label: "Custom (unknown)",
                                            id: "custom",
                                            greeting: "Unset",
                                            hint: "Unset",
                                            type: "builtIn",
                                            avatar:
                                              "./assets/avatars/builtin/custom.svg",
                                            displayName: "Custom (unknown)",
                                          }
                                        : prompts.find(
                                            (p) => p.id === item.type
                                          )
                                      : item.name ?? "User";

                                  let m = makeMessage(
                                    item.role === "user" ? 0 : 1,
                                    "Thinking...",
                                    i,
                                    pickedPrompt
                                  );

                                  if (item.role === "user") {
                                    updateMessage(m.elm, item.content);
                                  } else {
                                    m.query(".data .text").innerHTML =
                                      DOMPurify.sanitize(
                                        marked.parse(item.content)
                                      );
                                  }

                                  // console.log(item, m, i, pickedPrompt);
                                }

                                makeMsgSeparator();
                              }
                            }
                          } catch {
                            md.hide();
                          }
                        })
                    )
                  );

                modal.hide();
                let md = new Modal(modalContent);
                md.show();
              }),
            new Html("button")
              .text("Export")
              .classOn("fg-auto")
              .on("click", (e) => {
                modal.hide();
                const btn_modalContent = new Html("div")
                  .text("Here's your conversation:")
                  .append(
                    new Html("textarea")
                      .attr({ rows: 8 })
                      .html(
                        JSON.stringify(messageHistory.filter((m) => m !== null))
                      )
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              })
            // TODO: Save and load UI :(
          )
        );

      const modal = new Modal(modalContent);
      modal.show();
    });

  const userSettingsBtn = new Html("button")
    .text("Settings")
    .class("fg")
    .appendTo(multiRow)
    .on("click", () => {
      // User name input
      const usernameInput = new Html("input")
        .attr({
          type: "text",
          placeholder: "Username",
          maxlength: "24",
          minlength: "1",
        })
        .on("input", (e) => {
          localStorage.setItem("remembered-name", usernameInput.elm.value);
          const result = /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.elm.value);
          userName = result === true ? usernameInput.elm.value : "user";
          userSettings.username = userName;
          saveUserSettings();
          if (result === false) return (e.target.value = "User");
        });

      usernameInput.elm.value =
        localStorage.getItem("remembered-name") ?? "User";
      userName = /^[a-zA-Z0-9-]{0,24}$/.test(usernameInput.elm.value)
        ? usernameInput.elm.value
        : "user";

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
        .on("input", (e) => {
          userSettings.includeUsername = e.target.checked;
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
        .on("input", (e) => {
          userSettings.rememberContext = e.target.checked;
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
        .on("input", (e) => {
          document.documentElement.dataset.showAvatars = e.target.checked;
          userSettings.showAvatars = e.target.checked;
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
        .classOn("row", "pt-0", "pb-0");

      const settings_showNamesCheckbox = new Html("input")
        .attr({
          id: "shn",
          type: "checkbox",
          checked: userSettings.showNames === true ? true : undefined,
        })
        .on("input", (e) => {
          document.documentElement.dataset.showNames = e.target.checked;
          userSettings.showNames = e.target.checked;
          saveUserSettings();
        })
        .appendTo(settings_showNamesWrapper);
      new Html("label")
        .attr({
          for: "shn",
        })
        .text("Show names next to messages")
        .appendTo(settings_showNamesWrapper);

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
          new Html("option").text("Azure").attr({
            value: "azure",
            selected: userSettings.theme === "azure" ? true : undefined,
          }),
          new Html("option").text("Orchid").attr({
            value: "orchid",
            selected: userSettings.theme === "orchid" ? true : undefined,
          }),
          new Html("option").text("Forest").attr({
            value: "forest",
            selected: userSettings.theme === "forest" ? true : undefined,
          }),
          new Html("option").text("Maroon").attr({
            value: "maroon",
            selected: userSettings.theme === "maroon" ? true : undefined,
          }),
          new Html("option").text("Violet").attr({
            value: "violet",
            selected: userSettings.theme === "violet" ? true : undefined,
          })
        )
        .on("input", (e) => {
          document.documentElement.dataset.theme = e.target.value;
          userSettings.theme = e.target.value;
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
        .on("input", (e) => {
          document.documentElement.dataset.chatViewType = e.target.value;
          userSettings.chatViewType = e.target.value;
          saveUserSettings();
        });

      const promptPrefixBox = new Html("textarea")
        .attr({ rows: 4, placeholder: "<none>", resize: "none" })
        .html(userSettings.promptPrefix !== "" ? userSettings.promptPrefix : "")
        .on("input", (e) => {
          userSettings.promptPrefix =
            e.target.value.length > 0 ? e.target.value : false;
          saveUserSettings();
        });

      const modalContent = new Html("div")
        .classOn("col")
        .appendMany(
          new Html("fieldset").appendMany(
            new Html("legend").text("Personalization"),
            new Html("span").classOn("pb-2", "flex").text("Username"),
            usernameInput,
            settings_extraContentWrapper
          ),
          new Html("fieldset").appendMany(
            new Html("legend").text("Appearance"),
            new Html("span").classOn("pb-2", "flex").text("Theme"),
            themeSelect,
            new Html("span").classOn("pb-2", "pt-2", "flex").text("Chat Style"),
            chatSelect,
            settings_AppearanceContentWrapper
          ),
          new Html("fieldset").appendMany(
            new Html("legend").text("Chatbot Settings"),
            new Html("span").classOn("pb-2", "flex").text("Prompt prefix"),
            promptPrefixBox
          )
        );

      window.addEventListener("chatify-settings-update", function (e) {
        // Personalization
        usernameInput.elm.value = userSettings.username;
        settings_enableUserName.elm.checked = userSettings.includeUsername;
        settings_rememberContextCheckbox.elm.checked =
          userSettings.rememberContext;
        // Appearance
        themeSelect.elm.value = userSettings.theme;
        settings_showAvatarsCheckbox.elm.checked = userSettings.showAvatars;
        settings_showNamesCheckbox.elm.checked = userSettings.showNames;

        chatSelect.elm.value = userSettings.chatViewType;
        // Chatbot Settings
        promptPrefixBox.elm.value = userSettings.promptPrefix;
      });

      // Show the settings modal
      const modal = new Modal(modalContent);
      modal.show();
    });

  const requestUi_wrapper = new Html()
    .classOn("column")
    .appendTo(settingsContainer);

  const requestUi_text = new Html("span")
    .text("Please wait..")
    .appendTo(requestUi_wrapper);
  const requestUi_meter = new Html("div")
    .classOn("meter")
    .attr({ value: 0, max: 100 })
    .append(new Html().style({ width: "0%" }))
    .appendTo(requestUi_wrapper);
  const requestUi_hint = new Html("span")
    .classOn("small-text")
    .text("..")
    .appendTo(requestUi_wrapper);

  const versionData = await this.fetch("/api/version").then((j) => j.json());

  const changelogLink = new Html("a")
    .text(`View Changelog for ${versionData.version}`)
    .on("click", (e) => {
      let mc = new Html().html(versionData.changelog);
      let m = new Modal(mc);
      m.show();
    });
  const debugVersionNumber = new Html("span")
    .classOn("small-label")
    .style({ "margin-top": "auto" })
    .html(versionData.footerNote)
    .append(changelogLink)
    .appendTo(settingsContainer);

  function updaterequestsMessage() {
    if (apiUsage.remaining !== null) {
      requestUi_text.text(
        `${apiUsage.used} of ${apiUsage.total} requests used (${apiUsage.plan}).`
      );
      requestUi_meter.attr({
        value: apiUsage.used,
        max: apiUsage.total,
      });
      requestUi_meter.query("div").style.width =
        (apiUsage.used / apiUsage.total) * 100 + "%";
      requestUi_meter.classOff("extra-hidden");
      requestUi_hint.text(
        `Your quota resets in ${futureDate(new Date(apiUsage.expires))}.`
      );
    } else {
      requestUi_text.text(
        `0 of ${apiUsage.total} requests used (${apiUsage.plan}).`
      );
      requestUi_meter.classOn("extra-hidden");
      requestUi_hint.text("");
    }
  }

  updaterequestsMessage();

  marked.use({
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false,
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  function futureDate(fd) {
    const now = new Date();
    const diff = fd - now;

    let timeString = "";
    if (diff <= 0) {
      timeString = "now";
    } else if (diff < 1000 * 60) {
      timeString = `${Math.floor(diff / 1000)} seconds`;
    } else if (diff < 1000 * 60 * 60) {
      timeString = `${Math.floor(diff / (1000 * 60))} minutes`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      timeString = `${Math.floor(diff / (1000 * 60 * 60))} hours`;
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
      timeString = `${Math.floor(diff / (1000 * 60 * 60 * 24))} days`;
    } else {
      timeString = fd.toDateString();
    }

    return timeString;
  }

  let isTyping = false; // This will be true at any point message generation begins
  let currentSocket = null;
  let hasSetUp = false;

  function startTextGeneration() {
    if (isTyping) return false;
    request(inputArea.elm.value);
    inputArea.elm.value = "";
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

  function sendButton_StopGeneration() {
    try {
      currentSocket?.close && currentSocket?.close();
      currentSocket?.disconnect && currentSocket?.disconnect();
    } catch (e) {
      console.log("failed to close");
    }
  }
  function sendButton_StartGeneration() {
    if (!isTyping) {
      startTextGeneration();
    }
  }

  function updateState() {
    switch (isTyping) {
      case true:
        inputArea.attr({ placeholder: "Thinking..." });
        sendButton
          .classOn("neutral")
          .html(ICONS.stop)
          .on("click", sendButton_StopGeneration)
          .un("click", sendButton_StartGeneration);
        // console.log("truthy condition met", inputArea, sendButton);
        break;
      case false:
        inputArea.attr({ placeholder: "Message" });
        sendButton
          .classOff("neutral")
          .html(ICONS.send)
          .on("click", sendButton_StartGeneration)
          .un("click", sendButton_StopGeneration);
        // console.log("falsy condition met", inputArea, sendButton);
        break;
    }
  }

  function callAiStream(message, callback) {
    currentSocket = io(`${OPENAI_URL_WS}`);
    const socket = currentSocket;
    let receivedInitMessage = false;
    socket.on("connect", () => {
      select.disabled = true;
      const mh = messageHistory
        .filter((m) => m !== null)
        .slice(0, messageHistory.length - 1);
      socket.emit("begin", {
        user: userName,
        useUserName: userSettings.includeUsername,
        prompt: message,
        botPrompt: select.elm.value,
        customSettings: {
          temp: parseFloat(customSettings_temp.elm.value),
          system: customSettings_systemPrompt.elm.value,
        },
        rememberContext: userSettings.rememberContext,
        context: mh,
        userSettings: {
          timeZone: userSettings.timeZone,
          promptPrefix: userSettings.promptPrefix,
        },
      });
    });
    socket.on("recv", (event) => {
      if (receivedInitMessage === false) {
        // Save current conversation to localStorage with its set UUID
      }
      receivedInitMessage = true;
      callback({ msg: event.data.replace(/\\n/g, "\n") });
    });
    socket.on("err", (event) => {
      callback({
        unfilteredMsg:
          "<div id='AI_TEMP_ERR' class='error'>Something went wrong: " +
          event.errorMessage +
          "</div>",
      });
      const div = document.getElementById("AI_TEMP_ERR");
      div.id = "";
      return callback(true);
    });
    socket.on("done", () => {
      socket.close();
      callback(true);
    });
    let onErr = async (e) => {
      console.log("[ERR!!]", e);
      socket.close();
      if (receivedInitMessage === false) {
        receivedInitMessage = true; // idk this may prevent it from calling again
        callback({
          unfilteredMsg:
            "<div id='AI_TEMP_ERR' class='error'>Something went wrong, give me a moment..</div>",
        });
        const div = AI_TEMP_ERR;
        div.id = "";
        const result = await fetch("/api/usage")
          .then((j) => j.json())
          .catch((e) => {
            console.log("oops??", e);
          });
        try {
          if (result !== undefined) {
            div.innerHTML =
              result.remaining === 0
                ? "It looks like you ran out of available API requests.<br>Please try again in " +
                  futureDate(new Date(result.expires)) +
                  ", or ask the owner of this instance to update your plan."
                : "Something went wrong. " + e;
            console.error(e);
          } else {
            div.textContent +=
              " Also, It looks like you lost connection. Would you care to refresh?";
          }
        } catch (e) {
          div.textContent +=
            " Also, It looks like you lost connection. Would you care to refresh?";
        }
        callback(true);
      } else if (e === "io client disconnect") {
        // Disconnected BUT if we were in the middle of typing just stop completely
        callback(true);
      }
      select.disabled = false;
    };
    socket.on("disconnect", onErr);
    socket.on("error", onErr);
    socket.on("err", onErr);
  }

  async function callAiMessage(ai, message) {
    return new Promise((res, rej) => {
      let result = "";
      ai.querySelector(".data .text").innerHTML = "";
      ai.classList.add("thinking");
      let messages = [];
      callAiStream(message, (r) => {
        if (r === true) {
          ai.classList.remove("thinking");
          window.messages = messages;
          window.dispatchEvent(
            new CustomEvent("chatify-message-complete", {
              detail: { data: result },
            })
          );
          return res(result);
        }
        if (r === false) {
          // temp. clear
          ai.querySelector(".data .text").innerHTML = "";
        }
        if (r.unfilteredMsg) {
          result += r.unfilteredMsg;
          ai.querySelector(".data .text").innerHTML = result;
          return;
        }
        if (!r.msg) return console.log("?!");
        result += r.msg;
        ai.querySelector(".data .text").innerHTML = DOMPurify.sanitize(
          marked.parse(result)
        );
        scrollDown();

        window.sourceMessage = result;
        window.previousMessage = r;
        window.finalHtml = ai.querySelector(".data .text").innerHTML;
      });
    });
  }

  function makeMessage(
    side = 0,
    data,
    messageIndex,
    prompt = null,
    isSystem = false,
    actuallyGoesToMessageHistory = true
  ) {
    if (messageIndex === undefined) messageIndex = messageHistory.length;
    const msg = new Html().class("message");
    const messageContentWrapper = new Html().class("wrapper").appendTo(msg);
    const icon = new Html().class("icon").appendTo(messageContentWrapper);
    const dataContainer = new Html()
      .class("data", "fg-max")
      .appendTo(messageContentWrapper);
    const extra = new Html().class("center-row").appendTo(msg);
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
          uname.text(userName);
        }
        break;
      case 1:
        msg.class("gpt");
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
          if (aiAvatarOverride !== false) {
            icon.style({ "background-image": "url(" + aiAvatarOverride + ")" });
          }
          if (aiNameOverride !== false) {
            uname.text(aiNameOverride);
          }
        }
        if (isSystem === true)
          uname.elm.innerHTML += '<span class="badge">System</span>';
        break;
    }
    if (isSystem === false || actuallyGoesToMessageHistory === true) {
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
                        messageHistory[messageIndex] = null;
                        window.mh = messageHistory;
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
    msg.appendTo(messagesContainer);
    window.mh = messageHistory;
    scrollDown();
    return msg;
  }

  function makeMsgSeparator(content = "The conversation resumes.") {
    new Html()
      .append(new Html("span").classOn("text").text(content))
      .classOn("separator")
      .appendTo(messagesContainer);
    scrollDown();
  }

  function updateMessage(messageRef, data = null) {
    messageRef.querySelector(".data").classList.remove("muted", "dots-flow");

    if (data !== null) {
      if (data.startsWith('"')) data = data.slice(1);
      if (data.endsWith('"')) data = data.slice(0, -1);
      messageRef.querySelector(".data .text").innerHTML = DOMPurify.sanitize(
        marked.parse(data)
      );
    }
  }

  this.window.addEventListener("chatify-message-request", async (e) => {
    if (e.detail.history && e.detail.history === "remove") {
      messageHistory = [];
    }
    await request(e.detail.data, false);
  });

  async function request(text, addUserMessage = true) {
    message = text;

    const userIndex =
      messageHistory.push({
        role: "user",
        content: text,
        name: userSettings.username,
      }) - 1;

    const aiIndex =
      messageHistory.push({
        role: "assistant",
        type: select.elm.value,
        content: "Thinking...",
      }) - 1;

    const prompt = prompts.find((p) => p.id === select.elm.value) || prompts[0];

    console.log(messageHistory[aiIndex], prompt);

    let human;
    if (addUserMessage === true) {
      human = makeMessage(0, DOMPurify.sanitize(marked.parse(text)), userIndex);
    }
    let ai = makeMessage(1, "", aiIndex, prompt);

    isTyping = true;
    updateState();

    console.log(currentSocket);

    deleteConvoButton.elm.disabled = true; // Required otherwise bad things happen

    let result = await callAiMessage(
      ai.elm,
      text,
      messageHistory.slice(0, messageHistory.length - 1)
    );
    updateMessage(human.elm);
    messageHistory[aiIndex].content = result;

    isTyping = false;
    updateState();
    deleteConvoButton.elm.disabled = false;

    await checkRequests();
    updaterequestsMessage();
  }

  function scrollDown() {
    var chatWindow = messagesContainer.elm;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function autoExpandTextArea(e) {
    inputArea.elm.style.height = "auto";
    inputArea.elm.style.height = inputArea.elm.scrollHeight + 2 + "px";

    const inputAreaHeight = inputArea.elm.offsetHeight;
    messagesContainer.elm.style.paddingBottom = `${inputAreaHeight + 12}px`;
  }

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

  updateState();

  const b4UnloadHandler = (event) => {
    (event || window.event).returnValue = null;
    return null;
  };
});
