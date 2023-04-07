window.addEventListener("load", () => {
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
        this.elm.classList.toggle(val);
      }
      return this;
    }
    classOn(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.add(val);
      }
      return this;
    }
    classOff(...val) {
      for (let i = 0; i < val.length; i++) {
        this.elm.classList.remove(val);
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
        this.elm.setAttribute(key, obj[key]);
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
      this.closeBtn.class("close-btn");
      this.closeBtn.class("transparent");
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

  const pages = {
    home: {
      content: /*html*/ `
          <h1>Chatify Dashboard</h1>
          <p>What would you like to do?</p>

          <a href="#logs">View logs</a> &bull; <a href="#convos">View conversations</a>
        `,
      onload: () => {
        // Check api stuff
      },
    },
    logs: {
      content: /*html*/ `
          <h1>Logs</h1>
          <p>Log viewer</p>

          <a href="#">Back</a><br><br>
        `,
      onload: () => {
        // Check api stuff
        fetch("/api/dash/logs")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not OK");
            }
            return response.json();
          })
          .then((jsonData) => {
            jsonData.reverse();
            jsonData.forEach((log) => {
              document.body.insertAdjacentHTML(
                "beforeend",
                `<a href="#logView:${log}">${log}</a> `
              );
            });
          })
          .catch((error) => {
            console.log(`Error fetching logs: ${error}`);
            document.body.insertAdjacentHTML(
              "beforeend",
              `Error fetching logs: ${error}`
            );
          });
      },
    },
    logView: {
      content: "<h1>Log view: $</h1> <a href='#logs'>Back</a>",
      onload: (param) => {
        fetch(`/api/dash/logs/${param}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not OK");
            }
            return response.text();
          })
          .then((data) => {
            document.body.insertAdjacentHTML("beforeend", `<pre>${data}</pre>`);
          })
          .catch((error) => {
            console.log(`Error fetching log: ${error}`);
            document.body.insertAdjacentHTML(
              "beforeend",
              `Error fetching log: ${error}`
            );
          });
      },
    },
    convos: {
      content: /*html*/ `
          <h1>Conversations</h1>
          <p>Conversation logs are saved due to the fact that case you lose a conversation you were working on, as we currently have no ways of saving conversations client-side other than manual import/export.</p>

          <a href="#">Back</a> &bull; <input type="text" id="filterBox" placeholder="Search.."> <br><br>
          
          <div class="list"></div>
        `,
      onload: () => {
        // Check api stuff
        fetch("/api/dash/convos")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not OK");
            }
            return response.json();
          })
          .then((jsonData) => {
            jsonData.reverse();
            jsonData.forEach((log) => {
              document.body.querySelector('.list').insertAdjacentHTML(
                "beforeend",
                `<a href="#convoView:${log}">${log}</a> `
              );
            });
            document.body.querySelector('input[type="text"]').addEventListener('keyup', (e) => {
                const value = e.target.value.toLowerCase();
                
                document.querySelectorAll('.list a').forEach(function(item) {
                  const text = item.textContent.toLowerCase();
                  if (text.indexOf(value) !== -1) {
                    item.style.display = '';
                  } else {
                    item.style.display = 'none';
                  }
                });
            });
          })
          .catch((error) => {
            console.log(`Error fetching convos: ${error}`);
            document.body.insertAdjacentHTML(
              "beforeend",
              `Error fetching convos: ${error}`
            );
          });
      },
    },
    convoView: {
      content: "<h1>Conversation view: $</h1> <a href='#convos'>Back</a>",
      onload: (param) => {
        fetch(`/api/dash/convos/${param}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response not OK");
            }
            return response.json();
          })
          .then((resp) => {
            const jsonData = resp.data;
            console.log(resp);

            if (jsonData.customSettings && jsonData.customSettings.system) {
              document.body.insertAdjacentHTML(
                "beforeend",
                `<p><b>A custom prompt was ${
                  jsonData.botPrompt === "custom"
                    ? "used."
                    : "set, but not used."
                }.</b><br><p>Custom prompt:<br><span class="custom">System...</span><br>Temp: <span class="temp">Temp..</span>`
              );
              document.querySelector(".custom").textContent =
                jsonData.customSettings.system;
              document.querySelector(".temp").textContent =
                jsonData.customSettings.temp;
            }

            const tableBody = document.createElement("tbody");
            const tableHead = document.createElement("thead");

            // add table header
            const headerRow = tableHead.insertRow(-1);
            const userHeader = headerRow.insertCell(-1);
            const userPromptHeader = headerRow.insertCell(-1);
            const miscHeader = headerRow.insertCell(-1);
            userHeader.textContent = "Who";
            userPromptHeader.textContent = "Message";
            miscHeader.textContent = "Name";

            // add rows to table
            (resp.context ?? jsonData.context).forEach((interaction, index) => {
              const row = tableBody.insertRow(-1);
              const nameCell = row.insertCell(-1);
              const contentCell = row.insertCell(-1);
              const miscCell = row.insertCell(-1);
              nameCell.textContent = interaction.name || interaction.role;
              const oldCtxItem = (resp.oldCtx ?? jsonData.oldCtx)[index];
              contentCell.textContent = oldCtxItem.content;
              if (oldCtxItem) {
                miscCell.textContent = oldCtxItem.type ?? oldCtxItem.name;
              } else miscCell.textContent = interaction.role || "What";
              row.classList.add(
                interaction.role === "assistant" ? "gpt" : "user"
              );
            });

            const row = tableBody.insertRow(-1);
            const nameCell = row.insertCell(-1);
            const contentCell = row.insertCell(-1);
            const promptCell = row.insertCell(-1);
            nameCell.textContent = "assistant";
            contentCell.textContent = resp.result;
            promptCell.textContent = resp.botPrompt;
            row.classList.add("gpt");

            // Add a button for JSON history export
            new Html("button")
              .text("Export to JSON")
              .classOn("fg-auto")
              .on("click", (e) => {
                const newArray = JSON.parse(
                  JSON.stringify(resp.oldCtx ?? jsonData.oldCtx)
                );
                newArray.push({
                  role: "assistant",
                  type: resp.botPrompt ?? jsonData.botPrompt,
                  content: resp.result,
                });
                const btn_modalContent = new Html("div")
                  .text("Here's your conversation:")
                  .append(
                    new Html("textarea")
                      .attr({ rows: 8 })
                      .html(JSON.stringify(newArray))
                  );
                const btn_modal = new Modal(btn_modalContent);
                btn_modal.show();
              })
              .appendTo(document.body);

            // add table to document
            const table = document.createElement("table");
            table.appendChild(tableHead);
            table.appendChild(tableBody);
            document.body.appendChild(table);
          })
          .catch((error) => {
            console.log(`Error fetching convo: ${error}\n\n${error.stack}`);
            document.body.insertAdjacentHTML(
              "beforeend",
              `Error fetching convo: ${error}\n\n${error.stack}`
            );
          });
      },
    },
  };

  const changePage = () => {
    if (location.hash.substring(1) === "") location.hash = "#home";
    const [route, ...param] = location.hash.substring(1).split(":");
    if (pages.hasOwnProperty(route)) {
      const content = param
        ? pages[route].content.replace(/\$/g, param)
        : pages[route].content;
      document.body.innerHTML = content;
      pages[route].onload?.(param);
    }
  };

  window.addEventListener("hashchange", changePage);
  changePage();
});
