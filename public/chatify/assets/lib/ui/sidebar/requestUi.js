import Html from "../../../scripts/html.js";
import { store } from "../../_globals.js";

export default function requestUi(sideBar) {
  const requestUi_wrapper = new Html().classOn("column").appendTo(sideBar);

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

  store.set("requestUi_wrapper", requestUi_wrapper);
  store.set("requestUi_text", requestUi_text);
  store.set("requestUi_meter", requestUi_meter);
  store.set("requestUi_hint", requestUi_hint);
}
