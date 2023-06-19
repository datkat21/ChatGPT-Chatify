- [Chatify Changelogs](#chatify-changelogs)
  - [v0.4.0](#v040)
  - [v0.4.3](#v043)
  - [v0.4.4](#v044)
  - [v0.5.0](#v050)
  - [v0.5.1](#v051)
  - [v0.5.2](#v052)
  - [v0.5.3](#v053)


# Chatify Changelogs

This document will update alongside the changelogs that come with each new version.

## v0.4.0

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