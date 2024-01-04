import Html from "@datkat21/html";
import { store } from "../../_globals.js";
import Modal from "../../modal.js";

export async function versionCheck(container: Html) {
  const versionData = await fetch("/api/version").then((j) => j.json());

  document.title = `Chatify ${versionData.version}`;

  const changelogLink = new Html("a").text(`See Changelogs`).on("click", () => {
    let mc = new Html("div").html(versionData.changelog);
    let m = new Modal(mc);
    m.show();
  });
  const debugVersionNumber = new Html("span")
    .classOn("small-label")
    .style({ "margin-top": "auto" })
    .html(versionData.footerNote)
    .append(changelogLink)
    .appendTo(container);
  store.set("debugVersionNumber", debugVersionNumber);
}
