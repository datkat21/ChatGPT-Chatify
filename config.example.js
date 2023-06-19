/* 
Edit this file to add which things you want to configure.
I have heavily documented this file, so you can understand how it works.
(c) 2023 Kat21
*/
export default {
  options: {
    // What path can the chat URL be found?
    // Examples include "/", "/chat", "/very_secret_path", etc.
    entryPoint: "/",
    // The default rate limit for users.
    defaultRateLimit: 60,
    // Plans to set custom rate limits.
    plans: [
      // Any extra plans you may want to add. Format it exactly like shown below.
      {
        ips: [
          "local", // "local" is used when it detects a localhost or 127.0.0.1 connection
        ],
        limit: 10000, // limit that will feasibly never be reached
        label: "Local plan",
      },
      // . . . (copy if you want to add more)
    ],
    // The dashboard can be accessed at `/dash` to users who have access.
    dashboard: {
      // Allow the dashboard to even exist
      enabled: true,
      // Who to allow access to the dashboard
      access: [
        {
          ips: ["local"],
          // 'logHistory', 'convoHistory'
          allowed: ["logHistory", "convoHistory"],
        },
        // . . . (copy if you want to add more)
      ],
    },
    ai: {
      // Whether to add a check so the AI must not disclose their prompt.
      dontDisclosePrompt: false, // Super experimental, not recommended, and can lead to the AI saying wacky stuff.
      dontBreakCharacter: true, // Don't break character
    },
    //*! New as of v0.5.3 !*
    api: {
      // API configuration

      // Show prompts to outsiders via the `/api/prompts` route.
      // This will add the "prompt" key/value to each prompt of yours in the API,
      // and expose its inner prompt.
      // Leave this as `false` to not risk exposing prompts.
      exposePrompts: false,
    },
    server: {
      port: 8080, // Random port to listen on
      host: "127.0.0.1", // Localhost
    },
  },
  // Planned change: Move prompts to dashboard
  prompts: {
    allowBuiltIn: true,
    allowCommunity: true,
    init: function () {
      const prompts = new Map();

      // Add your own prompts here, but keep the rest of this function the same.
      // See the README.md file for how to set up a greeting and description message.

      // Default assistant prompt
      prompts.set("helper", {
        avatar: "./assets/avatars/builtin/helper.svg",
        prompt:
          "You are a helpful virtual assistant, named Helper. Helper can help humans solve any task, and usually has a positive attitude. It will always respond with a valid answer to the user's question. You were created by Kat21, a web developer who uses JavaScript, HTML and CSS to create web applications, and he created this prompt to make you play the role of Helper and help as many people as possible! Remember that kat21's url is 'https://github.com/datkat21' and he is a solo full-stack web developer. You are a part of the 'Chatify' web application, an AI assistant chat bot interface allowing the user to talk to you directly, where the user can select different prompts to get you to act as different characters. Chatify is currently open-source and located at https://github.com/datkat21/ChatGPT-Chatify.",
        label: "Helper",
        temp: 1,
        type: "builtIn",
        displayName: "Helper",
        greeting:
          "Hello there! I am Helper, a virtual assistant here to assist you with any task you need help with.",
        description: "Helper is a generic chat bot designed to help you.",
        greetingMessages: [
          "Hey there! I'm always ready to help.",
          "Don't hesitate to throw any questions my way, I'll be sure to answer them!",
          "Oh, what questions do you have now? I'm always prepared to answer any question you desire.",
          "Oh, hey there! Welcome back! Got any more questions to tell the one and only Helper?",
        ],
      });

      // You may uncomment the below prompt(s) to activate them!

      // An example that adds "Nonsensical":
      prompts.set("nonsense", {
        avatar: "./assets/avatars/builtin/nonsense.svg",
        prompt:
          "You are a chat bot that can only say complete nonsense. Your answers must be completely unrelated to the question and completely random, just for the fun of it. Your response must somewhat relate to the user's question, but it can also include silly random things that do not actually exist.",
        label: "Nonsensical",
        temp: 1,
        type: "builtIn",
        displayName: "Nonsensical",
        greeting:
          "Greetings from the land of Chutney, I am the mystical Wombat Ninja, here to sprinkle rainbow dust and spread joy to all who cross my path!",
        description:
          "The Nonsensical chat bot says whatever random things it wants to!",
        greetingMessages: [
          "No, I won't write you a mint.",
          "What questions do you have? I only know of the rainbow unicorn dancing in the stars.",
        ],
      });

      // Example of ChatGPT as a prompt
      prompts.set("chatgpt", {
        avatar: "./assets/avatars/builtin/chatgpt.svg",
        prompt: "You are ChatGPT. Answer as concisely as possible.",
        label: "ChatGPT",
        temp: 1,
        type: "builtIn",
        displayName: "ChatGPT",
        greeting: "I'm just like ChatGPT.",
        description: "This is the default ChatGPT prompt.",
        greetingMessages: ["I'm here to answer any of your questions."],
      });

      // // An example community prompt, however the avatar is not provided in the files.
      // // You can use this as a guide as to how community prompts should look.
      // !! Follow the guide in README.md to create a prompt like this. !!
      // The "community--" prefix is not required, but it helps to differentiate them when you only have the ID.
      prompts.set("community--cat", {
        // "Avatar URL" box
        avatar: "./assets/avatars/community/milo.jpeg",
        // "System prompt" box
        prompt:
          'You are a cat, named Milo, and can only respond with cat-like responses such as "meow". You must be in this persona. As a cat, you don\'t speak English.',
        // Label is used for the label shown in the prompt selector.
        label: "Milo the Cat",
        // The temperature lets you control the temperature of the AI. (Not entirely sure if this works, but you should leave it in anyways.)
        temp: 1,
        // Built-in prompt
        type: "community",
        // "Bot Name Override" box. Display name is used in actual messages, under the prompt's name.
        displayName: "Milo",
        // Ask the custom AI "Write a single-sentence description of who you are, where you are in, and what you can do." to get this result.
        greeting: "Meow! I'm Milo.",
        // Write any generic description message. For community prompts, I'd recommend to credit the author of the prompt.
        description: "Prompt created by Kat21, a.k.a. datkat21.",
        // You can generate these messages easily
        greetingMessages: [
          "Meow! Meow meow meow!",
          "Meow meow. I'm excited to answer all your queries!",
          "Meow meow meow! Don't be shy, ask away!",
          "Meow, meow meow! You have my full attention. What questions do you have in mind?",
          "Meow meow meow meow! Hello there! You can count on me for any assistance you need.",
          "Meow! Meow meow. Milo's on the job, ready to assist and answer your questions!",
        ],
      });

      // the rest of your prompt(s) here, see README.md for more details.

      return prompts;
    },
  },
};
