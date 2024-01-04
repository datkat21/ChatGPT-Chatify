import { store } from "./_globals.js";
import hljs from "../scripts/highlight.min.js";

export function parseMarkdown(text: string) {
  let inCodeBlock = false; // flag to track if we're inside a code block
  let parsedText = "";

  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");

  // Split the text into lines
  const lines = text.split("\n");

  // Loop through each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're inside a code block
    if (inCodeBlock) {
      // If we're inside a code block, check if this line ends the block
      if (line.trim() === "```") {
        inCodeBlock = false;
        parsedText += "</code></pre>";
      } else {
        // If we're still inside the code block, add the line to the parsed text
        parsedText += line + "\n";
      }
    } else {
      // If we're not inside a code block, check if this line starts a code block
      if (line.trim().startsWith("```")) {
        inCodeBlock = true;
        const language = line.trim().slice(3);
        parsedText += `<pre><code class="language-${language}">`;
      } else {
        // If we're not inside a code block, parse the line as normal markdown
        parsedText += parseMarkdownLine(line) + "\n";
      }
    }
  }

  // If we're still inside a code block at the end of the text, close it
  if (inCodeBlock) {
    parsedText += "</code></pre>";
  }

  const codeTags =
    parsedText.match(/<code.+?class="language-(.*?)".*?>[\s\S]+?<\/code>/gim) ||
    [];
  for (let i = 0; i < codeTags.length; i++) {
    const elem = document.createElement("div");
    elem.innerHTML = codeTags[i];
    const code = elem.textContent;
    const lang = codeTags[i].match(/class="language-([^"]+)"/i);
    const language = lang ? lang[1] : "plaintext";
    try {
      //@ts-ignore highlight.js doesn't export correctly
      const highlightedCode = hljs.highlight(code, { language }).value;
      parsedText = parsedText.replace(
        codeTags[i],
        `<code class="language-${language}">${highlightedCode}</code>`
      );
    } catch (e) {
      // ignore errors that come from highlighting, sometimes hljs can throw errors on unknown langs and such
    }
  }
  return parsedText;
}
export function parseMarkdownLine(line: string) {
  // Headers
  line = line.replace(/^# (.+)/gm, "<h1>$1</h1>");
  line = line.replace(/^## (.+)/gm, "<h2>$1</h2>");
  line = line.replace(/^### (.+)/gm, "<h3>$1</h3>");
  line = line.replace(/^#### (.+)/gm, "<h4>$1</h4>");
  line = line.replace(/^##### (.+)/gm, "<h5>$1</h5>");
  line = line.replace(/^###### (.+)/gm, "<h6>$1</h6>");

  // Bold and italic
  line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  line = line.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Images
  line = line.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');

  // Inline code
  line = line.replace(/`(.+?)`/g, "<code>$1</code>");

  // Paragraphs
  line = "<p>" + line + "</p>";

  return line;
}

export function toSnakeCase(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function futureDate(fd: Date) {
  const now = new Date();
  const diff = fd.getTime() - now.getTime();

  let timeString = "";
  if (diff <= 0) {
    timeString = "now";
  } else if (diff < 1000 * 60) {
    const seconds = Math.floor(diff / 1000);
    timeString = seconds === 1 ? `${seconds} second` : `${seconds} seconds`;
  } else if (diff < 1000 * 60 * 60) {
    const minutes = Math.floor(diff / (1000 * 60));
    timeString = minutes === 1 ? `${minutes} minute` : `${minutes} minutes`;
  } else if (diff < 1000 * 60 * 60 * 24) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    timeString = hours === 1 ? `${hours} hour` : `${hours} hours`;
  } else if (diff < 1000 * 60 * 60 * 24 * 7) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    timeString = days === 1 ? `${days} day` : `${days} days`;
  } else {
    timeString = fd.toDateString();
  }
  if (diff >= 0) timeString = "in " + timeString;

  return timeString;
}

export function scrollDown() {
  var chatWindow = store.get("messagesContainer").elm;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

export enum PromptPickType {
  Default,
  SingleAssistant,
}

export enum PromptType {
  BuiltIn = "builtIn",
  Community = "community",
  Saved = "saved",
}

export interface Prompt {
  label?: string;
  id?: string;
  greeting?: string;
  hint?: string;
  type?: PromptType;
  avatar?: string;
  displayName?: string;
  prompt?: string;
  greetingMessages?: string[];
}
