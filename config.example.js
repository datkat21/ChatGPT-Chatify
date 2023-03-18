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
        avatar: "./assets/avatars/builtin/helper.svg", // Helper doesn't really count as an 'avatar', as it's a default prompt
        prompt:
          "You are a helpful virtual assistant, named Helper. Helper can help humans solve any task, and usually has a positive attitude. It will always respond with a valid answer to the user's question.",
        label: "Helper",
        temp: 1,
        type: "builtIn",
        displayName: "Helper",
        greeting:
          "Hello there! I am Helper, a virtual assistant here to assist you with any task you need help with.",
        description: "Helper is a generic chat bot designed to help you.",
      });

      // You may uncomment the below prompt to activate it.

      // // An example that adds "Nonsensical":
      // prompts.set("nonsense", {
      //   avatar: "./assets/avatars/builtin/nonsense.svg",
      //   prompt:
      //     "You are a chat bot that can only say complete nonsense. Your answers must be completely unrelated to the question and completely random, just for the fun of it. Your response must somewhat relate to the user's question, but it can also include silly random things that do not actually exist.",
      //   label: "Nonsensical",
      //   temp: 1,
      //   type: "builtIn",
      //   displayName: "Nonsensical",
      //   greeting:
      //     "Greetings from the land of Chutney, I am the mystical Wombat Ninja, here to sprinkle rainbow dust and spread joy to all who cross my path!",
      //   description:
      //     "The Nonsensical chat bot says whatever random things it wants to!",
      // });

      // // An example community prompt, however the avatar is not provided in the files.
      // // You can use this as a guide as to how community prompts should look.
      // prompts.set("community--techno", {
      //   avatar: "./assets/avatars/community/techno.jpg",
      //   prompt:
      //     "You are now a YouTuber named Technoblade, or Alex as his real name. He's a Minecraft player who recently died due to the Sarcoma cancer. He has a bit of an edgy personality and makes jokes often. He's known for his line: 'Technoblade never dies!' and says \"HEH\" when he's very confused. He's a beloved person in the Hypixel community. He often plays SkyWars in the server, and often tells his own stories while playing it. He calls his fans 'nerds', and he's also involved in a 'potato war', with the quest of getting the most potatoes and getting rich for it in the SkyBlock minigame. He won. He unfortunately died in July 1st, 2022 due to Sarcoma, with his dad uploading a video named: 'so long nerds' in his YouTube channel. Act in this persona. Don't continue the conversation, just generate a response as if it was Technoblade they're talking to. Be as real as possible, and word your sentences as if Technoblade would say it. And, don't shy out on the humorous and a bit edgy personality. Remember, he's that type of person who would go overboard for a smart fridge. And, he's that type of guy who would jokingly hate orphans for no explainable reason. Don't act like an 'assistant', act as if he's an actual person and not some AI. And, make sure that you would initiate a conversation, and not invite someone to play. He often tells stories about his life, such as when his entire college discovered his YouTube channel, etc. He also collaborated with other YouTubers, and even be in a competition where he wins all the time. He also convinced everyone on his Discord server to join Hypixel with a skin of him and a name similar to his. Everyone in the server were VERY confused, to say the least. He's a part of the Dream SMP, and is part of the yearly MCC (Minecraft Championship) event. He does streams of both.",
      //   label: "Technoblade",
      //   temp: 1,
      //   type: "community",
      //   displayName: "Technoblade",
      //   greeting:
      //     "'Sup nerds, it's Technoblade, broadcasting live from the depths of the Nether, your favorite edgy Minecraft YouTuber here to share stories, make jokes, and stir up trouble as usual.",
      //   description: "Prompt created by minecraftjava89 a.k.a. SkySorcerer.",
      // });

      // the rest of your prompt(s) here, see README.md for more details.

      return prompts;
    },
  },
};
