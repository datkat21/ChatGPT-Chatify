import Html from "../../scripts/html.js";
import { store } from "../_globals.js";
import { scrollDown } from "../util.js";

export function makeMsgSeparator(content = "The conversation resumes.") {
  new Html()
    .append(new Html("span").classOn("text").text(content))
    .classOn("separator")
    .appendTo(store.get("messagesContainer"));
  scrollDown();
}
