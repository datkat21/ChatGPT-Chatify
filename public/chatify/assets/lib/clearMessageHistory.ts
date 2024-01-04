import { store } from "./_globals.js";
import { makeMsgSeparator } from "./ui/separator.js";
import { sendButton_StopGeneration } from "./ui/state.js";

export function actuallyClearMessageHistory() {
  store.set("messageHistory", []);
  store.get("messagesContainer").html("");
  makeMsgSeparator("Your conversation begins here.");
}

export function clearMessageHistory() {
  if (confirm("Are you sure you want to clear your history?")) {
    try {
      sendButton_StopGeneration();
    } catch {}
    actuallyClearMessageHistory();
  }
}
