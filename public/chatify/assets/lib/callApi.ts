import { store } from "./_globals.js";
import { futureDate, parseMarkdown, scrollDown } from "./util.js";
import DOMPurify from "../scripts/purify.min.js";
import { mpGetPromptsSelected } from "./ui/sidebar/multiPrompt.js";

export async function callAiStream(
  message: string,
  callback: CallableFunction
) {
  try {
    const userSettings = store.get("userSettings");
    const data = {
      user: store.get("userName"),
      useUserName: store.get("userSettings").includeUsername,
      prompt: message,
      botPrompt: store.get("select").elm.value,
      customSettings: {
        temp: parseFloat(store.get("customSettings_temp").elm.value),
        system: store.get("customSettings_systemPrompt").elm.value,
      },
      rememberContext: store.get("userSettings").rememberContext,
      context: store
        .get("messageHistory")
        .filter((m: any) => m !== null)
        .slice(0, store.get("messageHistory").length - 1),
      userSettings: {
        timeZone: userSettings.timeZone,
        promptPrefix:
          userSettings.promptPrefixEnabled === true
            ? userSettings.promptPrefix
            : "",
        testMode: userSettings.testMode,
        ctxLength: userSettings.ctxLength,
        maxTokens: userSettings.maxTokens,
      },
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    let shouldContinue: number = 1;
    let error = null;

    const response = (await fetch("/api/stream", options)
      .then(async (r) => {
        if (!r.ok) {
          // Expect an error in the body
          console.log("whoops");
          shouldContinue = 0;
          let errorData = await r.json();
          switch (errorData.errorCode) {
            case "too_many_requests":
              error = `You have used too many requests (${
                store.get("apiUsage").used
              } of ${
                store.get("apiUsage").total
              }) in the past hour. Please try again ${futureDate(
                new Date(store.get("apiUsage").expires)
              )} from now.`;
              break;
            default:
              error = errorData.errorMessage;
              break;
          }
        } else return r;
      })
      .catch((e) => {
        shouldContinue = 0;
        error = e;
      })) as Response;

    if (shouldContinue === 0) {
      console.log("shouldContinue FAILED");
      callback({
        unfilteredMsg: `<div id='AI_TEMP_ERR' class='error'>${error}</div>`,
      });
      callback(true);
      return;
    }

    const stream = response.body as ReadableStream<Uint8Array>;

    const reader = stream.getReader();
    let td = new TextDecoder();
    let buffer = "";

    window.addEventListener("chatify-premature-end", (e) => {
      callback(true);
    });

    store.set("currentSocket", reader);

    //     reader
    //       .read()
    //       .then(function processResult(result) {
    //         if (result.done) {
    //           return;
    //         }
    //         let r = td.decode(result.value);
    //         // console.log(result, r);
    //         buffer += r.replace(/data:/g, ""); // add new data to buffer
    //         const events = buffer.split(`\n
    //   `); // split buffer into individual events
    //         buffer = events.pop(); // store incomplete event in buffer
    //         for (const event of events) {
    //           console.log("evt:", event);
    //           try {
    //             const parsedEvent = JSON.parse(event);
    //             console.log("parsed:", parsedEvent);
    //             if (parsedEvent.type === "done") {
    //               callback(true);
    //               break;
    //             } else if (parsedEvent.type === "error") {
    //               let msg = parsedEvent.data;
    //               switch (msg) {
    //                 case "invalid_api_key":
    //                   msg =
    //                     "The owner of this instance has not set up their API key properly, this is not a problem on your end.";
    //                   break;
    //                 case "too_many_requests":
    //                   break;
    //               }
    //               callback({
    //                 unfilteredMsg: `<div id='AI_TEMP_ERR' class='error'>Something went wrong: ${msg}</div>`,
    //               });
    //               callback(true);
    //               return;
    //             } else if (parsedEvent.type === "inc") {
    //               // incoming
    //               console.log("HI");
    //               callback({ msg: parsedEvent.data.replace(/\\n/g, "\n") });
    //             }
    //           } catch (err) {
    //             console.error(err);
    //           }
    //         }
    //         return reader.read().then(processResult);
    //       })
    reader
      .read()
      .then(async function processResult(result): Promise<any> {
        if (result.done) {
          return;
        }
        let r = td.decode(result.value);
        buffer += r.replace(/data:/g, ""); // add new data to buffer
        const events = buffer.split(`\n`);

        buffer = events.pop()?.toString() as string;

        for (const event of events) {
          try {
            const parsedEvent = JSON.parse(event);
            if (parsedEvent.type === "done") {
              callback(true);
              break;
            } else if (parsedEvent.type === "error") {
              let msg = parsedEvent.data;
              switch (msg) {
                case "invalid_api_key":
                  msg =
                    "The owner of this instance has not set up their API key properly, this is not a problem on your end.";
                  break;
                case "too_many_requests":
                  break;
              }
              callback({
                unfilteredMsg: `<div id='AI_TEMP_ERR' class='error'>Something went wrong: ${msg}</div>`,
              });
              callback(true);
              return;
            } else if (parsedEvent.type === "inc") {
              await new Promise((resolve) => {
                setTimeout(resolve, 0); // Waiting for the event loop to execute any other pending tasks
              });

              callback({ msg: parsedEvent.data.replace(/\\n/g, "\n") });
            }
          } catch (err) {
            // console.error(err);
          }
        }

        return reader.read().then(processResult);
      })
      .catch((err) => {
        console.error(err);
        callback({
          unfilteredMsg: `<div id='AI_TEMP_ERR' class='error'>Sorry, but there was an error while loading the response: ${err}</div>`,
        });
        // TODO: Figure out the error
        return callback(true);
      });
  } catch (e) {
    console.error(e);
    callback({
      unfilteredMsg: `<div id='AI_TEMP_ERR' class='error'>Sorry, but there was an error while loading the response: ${e}</div>`,
    });
    // TODO: Figure out the error
    return callback(true);
  }
}

export async function callAiMessage(ai: HTMLElement, message: string) {
  return new Promise(async (res, rej) => {
    let result = "";
    let x = ai.querySelector(".data .text");
    if (x !== null) {
      x.innerHTML = "";
    }
    ai.classList.add("thinking");
    let messages: any[] = [];
    callAiStream(message, (r: any) => {
      // boolean | { unfilteredMsg: string } | false | { message: string }) => {
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
        if (x !== null) x.innerHTML = "";
        return;
      }
      if (r.unfilteredMsg) {
        result += r.unfilteredMsg;
        if (x !== null) x.innerHTML = result;
        return;
      }
      if (!r.msg) return console.log("?!");
      result += r.msg;
      if (x !== null) x.innerHTML = DOMPurify.sanitize(parseMarkdown(result));
      scrollDown();

      window.sourceMessage = result;
      window.previousMessage = r;
      window.finalHtml = x !== null ? x.innerHTML : null;
    });
  });
}
