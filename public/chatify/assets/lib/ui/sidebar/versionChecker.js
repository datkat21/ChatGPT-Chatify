import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";
import Modal from "../../modal.js";

export async function versionCheck(container) {
  const versionData = await fetch("/api/version").then((j) => j.json());

  document.title = `Chatify ${versionData.version}`;

  const changelogLink = new Html("a")
    .text(`See Changelogs`)
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
    .appendTo(container);
  store.set("debugVersionNumber", debugVersionNumber);
}
