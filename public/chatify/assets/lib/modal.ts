import Html from "@datkat21/html";

export default class Modal {
  modal;
  content;
  closeBtn;
  overlay;
  elementsArray;
  constructor(content: string | HTMLElement | Html) {
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

    this.modal.on("keydown", (e: any) => {
      this.handleKeyDown(e);
    });

    const focusableElements = this.content.elm.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="checkbox"], input[type="radio"], select'
    );
    this.elementsArray = Array.prototype.slice.call(focusableElements);
    this.elementsArray.forEach((el) => {
      el.setAttribute("tabindex", "0");
    });

    this.elementsArray[0].addEventListener("keydown", (e: any) => {
      if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        this.elementsArray[this.elementsArray.length - 1].focus();
      }
    });
    this.elementsArray[this.elementsArray.length - 1].addEventListener(
      "keydown",
      (e: any) => {
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

  tempHide() {
    this.modal.style({ display: "none" });
  }

  tempShow() {
    this.modal.style({ display: "block" });
  }

  hide() {
    this.modal.cleanup();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.hide();
    }
  }
}
