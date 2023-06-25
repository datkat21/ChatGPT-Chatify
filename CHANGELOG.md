- [Chatify Changelogs](#chatify-changelogs)
  - [v0.3.7](#v037)
  - [v0.3.8](#v038)
  - [v0.4.0 (first open source version)](#v040-first-open-source-version)
  - [v0.4.3](#v043)
  - [v0.4.4](#v044)
  - [v0.5.0](#v050)
  - [v0.5.1](#v051)
  - [v0.5.2](#v052)
  - [v0.5.3](#v053)
  - [v0.5.4](#v054)
  - [v0.5.5](#v055)
  - [v0.5.6](#v056)
  - [v0.5.7](#v057)


# Chatify Changelogs

This document will update alongside the changelogs that come with each new version.

(Updates v0.2.0, v0.2.1, v0.3.0, v0.3.2, and v0.3.5 had no changelogs.)

## v0.3.7

- Semi-functional prompt saving and loading
- AI remembers much more of the conversation when using "Experimental: Remember context better" **(Note as of 6/19: This old feature is no longer recommended)**
- VERY primitive themes system, only accessible by changing `data-theme` attribute on the html element to `light`, `dark`, or `amoled`.
- I'm typing this at 4am so let me know if there are 1000 bugs, or anything I missed..

## v0.3.8

- Conversations using custom prompts will now import correctly, but fall back to Helper for some reason. This is currently a known issue and I will look into it later.
- Updated server-side plans system, and now your refresh time is correctly based on your first message's time and not your latest.

## v0.4.0 (first open source version)

- Entire server-side codebase revamp.
    - Migrated from `ws` to `Socket.IO`
    - Cleaned up code in general
    - Revamped most of everything to work alongside a configuration file
    - Migrated overused functions to api.js

## v0.4.3

- Updated server-side dashboard
- Type messages while the AI is responding
- Stop text generation
- Automatic date/time recognition based on your time zone

## v0.4.4

- User settings modal is now complete and functional
- Selecting a new prompt provides a random predetermined greeting

## v0.5.0

- New theme
- New chat appearance settings
- Settings live update for other tabs
- More features to be added…soon™️

## v0.5.1

- A few brand new color themes (Azure (previously known as *Clean Dark* in v0.5.0), Maroon, Orchid, Forest, and Violet)
- More customization options (toggle showing and hiding of avatars and names in messages, as well as a new "Flat Bubbles" chat viewing style)
- **Hopefully** fixed most server side crashing issues

## v0.5.2

- A new theme - Lemon
- Re-ordered themes so they are rainbow-colored
- Completely migrated the slow and old Axios over to the [new OpenAI beta Node.js API](https://github.com/openai/openai-node/discussions/182)
- Added Test Mode so users can test streaming via the Chatify API
- Alongside streaming, the Socket.IO and POST APIs will still be available for old applications, but their use is discouraged.

## v0.5.3

- New markdown parser, including handling code blocks like ChatGPT (instead of breaking as it types them it shows the code block as it's being typed)
- Re-done some CSS work and patched up light theme to make it more user-friendly

(Below features are not mentioned in patch notes)

- New feature inside `config.js` to opt in to exposing the actual system prompts to the `/api/prompts` endpoint
- (Bugged, not working) feature for the end-user to delete their own "saved" prompts

## v0.5.4

- Added a new 'copy to clipboard' button next to messages, which is toggleable in settings

## v0.5.5

- Fix the bug mentioned in v0.5.3

## v0.5.6

- Reworked a lot of the client code, moving prompt selection into an asynchronous function (`promptPick`, could be useful in scripts potentially)

## v0.5.7

- Patched and updated markdown support and fixed the title to auto update as the version is loaded.