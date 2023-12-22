# Chatify Changelogs

This document will update alongside the changelogs that come with each new version.

(Updates v0.0.1-v0.2.0, v0.2.1, v0.3.0, v0.3.2, and v0.3.5 had no changelogs.)

[Jump to Latest](#v058)

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
  - [v0.5.8](#v058)
  - [v0.5.9](#v059)
  - [v0.5.10](#v0510)
  - [v0.6.0](#v060)
    - [Known Bugs](#known-bugs)
  - [v0.6.1](#v061)
    - [Known Bugs](#known-bugs-1)
  - [v0.6.2](#v062)
  - [v0.6.3](#v063)
  - [v0.6.4](#v064)

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

- Patched and updated markdown support (element tags not being escaped properly)
- Fixed the title to auto update as the version is loaded

## v0.5.8

- Patch a small bug in the markdown parser introduced with v0.5.7
- Update server-side features list so it properly uses the CHANGELOG.md document

## v0.5.9

- Fix an issue where error messages don't show up (started with v0.5.2) and improved error messages client-side for user friendliness
- Added an option in the settings to customize context length in tokens

## v0.5.10

- Added fuzzy search support via Fuse.js
- Some minor quality of life improvements
- Added "Lavender" theme, a new attempt at a dark theme

## v0.6.0

- Updated the [Html](https://github.com/datkat21/html) dependency to v1.1.1
- Minor CSS fixes:
  - Fixed a long-lasting issue where text that was too long made the entire container scroll horizontally
- Basic message editing system (and the ability to hide the edit button)
- Fixed an issue where custom prompts wouldn't load automatically on conversation import
- Fixed a long-lasting bug where Dashboard logs would have "undefined" appended to them
- Prompt prefix can be toggled on/off

### Known Bugs

- Edit button changes won't sync across tabs, to be fixed in v0.6.1
- Disabling prompt prefix doesn't work properly

## v0.6.1

- Fixed a couple small issues mentioned in v0.6.0:
  - Partially syncing edit button feature
  - Fixed a small issue relating to when the prompt prefix is disabled it doesn't work

### Known Bugs

- Toggling the edit button won't work until you open the settings menu

## v0.6.2

- Fixed an accidental issue relating to custom prompts
- Added handy scroll to bottom button for people who have a long list of prompts
- Minor improvements

## v0.6.3

To keep consistency with git, I accidentally wrote 0.6.3 as the 0.6.2 changelog. Whoops.

## v0.6.4

- Added import and export buttons to the settings menu
- WIP language support, will be coming in a future date