import {
  saveAssistant,
  loadAssistant,
  deleteAssistant,
} from "./assistant.js";
import { importAndLoadPrompt } from "./promptHandling.js";
import settingsListener from "./settingsListener.js";
import { store } from "./_globals.js";
import setupSidebar from "./ui/sidebar.js";
import { makeMsgSeparator } from "./ui/separator.js";
import { setupMessages } from "./ui/messages.js";
import { updateState } from "./ui/state.js";

settingsListener();

// Some globals
store.set("assistantObj", null);
store.set("loadedCustomPrompt", {});

store.set("lastScrollTop", -1);
store.set("lastScrollHeight", -1);

store.set(
  "OPENAI_URL_WS",
  `${location.protocol.replace("http", "ws")}//${location.host}/stream`
);

await setupSidebar();
setupMessages();

store.set("messageHistory", []);
store.set("menuState", true);

makeMsgSeparator("Your conversation begins here.");


updateState();

