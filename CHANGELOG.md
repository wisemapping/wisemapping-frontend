# Changelog

All notable changes to the Wisemapping Frontend project are documented in this file.

## October 2026

### 🚀 User Experience

- **Find in Map**: New search panel (`Ctrl/⌘ + F`) that lists every node matching what you type, highlights the match, and jumps to it. Clicking a result now also closes the panel, leaving you on the node ready to edit. `Enter` / `Shift + Enter` and the arrow buttons step through matches without closing it.
- **Share a Link to a Node**: "Copy link to node" in the editor toolbar copies a link that opens the map with that specific node revealed and centred — handy for pointing a colleague at one branch of a large map.
- **Paste Under a Topic**: `Ctrl/⌘ + Shift + V` pastes copied topics as children of the selected one. Plain `Ctrl/⌘ + V` keeps pasting onto the canvas exactly as before.
- **Rearrange Topics by Keyboard**: `Alt + Shift + ↑/↓` moves a topic up or down among its siblings, and `Alt + Shift + ←/→` outdents or indents it — the bindings outline editors use. Rearranging a map previously needed the mouse. Each move is a single undo step, just like a drag.
- **Trackpad Navigation**: A two-finger swipe now pans the canvas instead of zooming it, matching other diagramming tools. Zooming moves to the wheel with `Ctrl`, `⌘` or `Alt` held.

### 🐛 Bug Fixes

- **Dialog and Menu Styling**: Fixed a styling helper that silently discarded theme-dependent rules, so dialogs and the selected item in the map list now render with their intended borders and colours in both light and dark mode.
- **Selection Events**: Selecting a single topic no longer fires both "focus" and "blur" at once, and multi-selection now reports focus correctly.
- **Toolbar Stability**: Topic property controls no longer throw when nothing is selected, the zoom readout keeps updating after a map loads, and the duplicated zoom shortcut that jumped two steps per keypress is gone.

### 🔧 Technical Improvements

- **Quality Assurance**: The web application gained its first unit-test harness, plus an automated accessibility scan that reports findings on every integration run. Over 600 unit tests now run across the project.
- **Editor Internals**: The editor toolbar's selection handling, keyboard-shortcut formatting and layout were reworked, and the map list's navigation drawer moved into its own module — no visible change, less duplication.
- **Accessibility**: Fixed incorrect ARIA attributes and layering in the editor toolbar.

## February 2026

### 🛡️ Security & Reliability

- **Secure Logout**: Enhanced the logout process to ensure all user sessions and cached data are completely cleared, improving effective security.
- **Image Export**: Fixed an issue preventing image exports by updating security policies to allow blob images.

### 🔧 Technical Improvements

- **Build System**: Optimized internationalization build scripts for better compatibility.

## January 2026

### 🚀 User Experience

- **Try Mode Navigation**: Improved navigation behavior in "Try Mode", ensuring the back button correctly returns users to the map list.

### 🔧 Technical Improvements

- **Quality Assurance**: Added new automated tests for editor navigation to prevent future regressions.
- **Dependencies**: Updated core development libraries for improved stability and performance.

## November 2025

### 📱 Mobile & UI Improvements

- **Mobile Experience**: Enhanced mobile web app support for a better experience on phones and tablets.
- **Visual Polish**: Fixed visual artifacts (ripple effects) on interactive elements.

### 🛡️ Security

- **Link Safety**: Added security attributes (`rel="nofollow"`) to user-generated links to enhance platform safety.

### 🐛 Bug Fixes

- **Stability**: Fixed issues with map loading and editor focus management to prevent crashes and weird behaviors.
- **Error Handling**: Improved error reporting when things go wrong, aiding in faster debugging.

## October 2025

### 🚀 Major Features

- **Outline View**: Introduced a new hierarchical view for mind maps, allowing users to navigate and organize topics as a structured list.
- **Dark Mode**: Added full support for Dark Mode, automatically respecting system preferences or user selection.
- **Social Sharing**: Enabled Facebook integration for easy sharing of mind maps.

### 🌍 Language Support

- **Global Reach**: Expanded support to 12 languages with instant, seamless language switching.

### 🎨 Visual & Customization

- **Rich Themes**: Launched a new theme system with multiple variants (Ocean, Classic, Robot, Prism).
- **Custom Backgrounds**: Users can now personalize their map backgrounds with custom colors.
- **Emoji Support**: Added support for emojis in topics for more expressive maps.

### 🔧 Performance

- **Faster Loading**: Optimized application bundle size and loading strategies for quicker startup.

## September 2025

### 🚀 Features

- **Docker Support**: Released full-stack Docker images to simplify self-hosted deployments.
- **Theme Architecture**: Laid the groundwork for the new advanced theming system.

_This changelog is updated manually to highlight functional changes._
