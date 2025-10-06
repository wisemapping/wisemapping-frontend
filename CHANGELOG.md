# Changelog

All notable changes to the Wisemapping Frontend project are documented in this file.

## Week of Oct 1 - October 6, 2025

### 🌍 Global Language Support

- **12 Languages Available**: English, Spanish, French, German, Russian, Ukrainian, Chinese, Japanese, Portuguese, Italian, Hindi
- **Instant Language Switching**: Real-time language changes without page reload
- **Persistent Settings**: Language preferences saved across sessions

## 🌍 Supported Languages

| Language              | Code    | Native Name   | Package Support |
| --------------------- | ------- | ------------- | --------------- |
| 🇺🇸 English            | `en`    | English       | All packages    |
| 🇪🇸 Spanish            | `es`    | Español       | All packages    |
| 🇫🇷 French             | `fr`    | Français      | All packages    |
| 🇩🇪 German             | `de`    | Deutsch       | All packages    |
| 🇷🇺 Russian            | `ru`    | Pусский       | All packages    |
| 🇺🇦 Ukrainian          | `uk`    | Українська    | Webapp, Editor  |
| 🇨🇳 Chinese            | `zh`    | 中文 (简体)   | All packages    |
| 🇨🇳 Chinese Simplified | `zh-CN` | 中文 (普通话) | Webapp, Editor  |
| 🇯🇵 Japanese           | `ja`    | 日本語        | All packages    |
| 🇵🇹 Portuguese         | `pt`    | Português     | All packages    |
| 🇮🇹 Italian            | `it`    | Italiano      | All packages    |
| 🇮🇳 Hindi              | `hi`    | हिन्दी        | All packages    |

### Package Support

- **Webapp & Editor**: 12 languages (full support)
- **Mindplot**: 11 languages (excludes Ukrainian, Chinese Simplified)
- **Implementation**: FormatJS with react-intl, compiled AST format

---

## Week of September 24 - October 1, 2025

### 🚀 Major Features & Enhancements

#### Visual Customization

- **Dark Mode**: Users can now switch between light and dark themes for comfortable viewing in any environment
- **Multiple Theme Options**: Choose from various theme variants including Ocean, Classic, Robot, and Prism themes
- **Custom Background Colors**: Personalize mindmaps with custom background colors that match your preferences
- **Enhanced Visual Styling**: Improved relationship styling and visual elements for better mindmap presentation

#### Social & Collaboration Features

- **Facebook Integration**: Share and collaborate on mindmaps through Facebook social media integration
- **Enhanced Sharing**: Improved sharing capabilities for better collaboration with team members

#### Import/Export Capabilities

- **FreeMind Import**: Import mindmaps from FreeMind format with improved compatibility
- **XMind Import**: Complete support for importing XMind files into the application
- **Emoji Support**: Add emoji-based images and icons to enhance mindmap visual appeal
- **Account Management**: Streamlined account deletion process with improved user experience

### 🚀 Performance & Reliability

#### Enhanced Application Performance

- **Faster Loading**: Improved application startup and loading times for better user experience
- **Smoother Interactions**: Enhanced responsiveness across all user interface elements
- **Better Stability**: Increased application reliability with improved error handling
- **Optimized Resources**: More efficient use of system resources for better performance

#### Quality Assurance

- **Comprehensive Testing**: Enhanced test coverage ensures more reliable functionality
- **Improved Reliability**: Better error handling and recovery mechanisms
- **Consistent Experience**: More predictable behavior across different browsers and devices

### 🎨 Enhanced User Experience

#### Improved Visual Design

- **Enhanced Theme System**: Improved theme selector and visual consistency across the application
- **Better Image Rendering**: Enhanced image display and interaction capabilities
- **Improved Color Management**: Better color resolution and theme integration

#### Performance & Privacy

- **Optimized Analytics**: Streamlined analytics implementation for better performance
- **Enhanced Privacy**: Improved user privacy with refined tracking mechanisms

### 📦 Dependencies & Version Updates

#### Version Management

- **Version 6**: Updated application to version 6.0
- **Copyright**: Updated copyright information across the project
- **Package Updates**: Various package.json updates for consistency

### 🔄 Refactoring & Architecture

#### Theme Architecture

- **ThemeFactory**: Updated ThemeFactory.create() and createById() to require variant parameters
- **Theme Implementations**: Refactored all theme implementations (PrismTheme, EnhancedPrismTheme, DarkPrismTheme, ClassicTheme, RobotTheme)
- **Topic Styling**: Updated Topic class methods for better theme integration
- **Component Updates**: Updated all components to properly handle theme variants

#### Component Improvements

- **StandaloneActionDispatcher**: Enhanced color change methods to use Designer's current variant
- **NodePropertyBuilder**: Updated to pass variant when getting color values
- **MindplotWebComponent**: Improved theme resolution and variant handling

### 🏗️ Architecture Improvements

#### Enhanced Component System

- **Modernized Theme Architecture**: Improved theme system with better component integration
- **Enhanced Component Library**: Updated core components for better performance and maintainability
- **Improved Editor Components**: Enhanced editor functionality with better theme support

### 🎯 Impact Summary

This week's changes represent a major milestone in the Wisemapping Frontend project:

1. **Enhanced User Experience**: Dark mode support and improved theming provide users with better visual customization options
2. **Better Performance**: Removal of jQuery and code cleanup improve application performance
3. **Improved Maintainability**: JSON-based theme configuration and better type safety make the codebase more maintainable
4. **Social Integration**: Facebook support expands collaboration capabilities
5. **Quality Assurance**: Comprehensive testing improvements ensure more reliable functionality

### 🔮 Future Considerations

The theme system overhaul and dark mode implementation provide a solid foundation for:

- Additional theme variants and customization options
- Enhanced accessibility features
- Improved mobile responsiveness
- Advanced collaboration features

## Week of October 1 - October 8, 2025

### 🐛 Bug Fixes & Improvements

#### TypeScript Error Resolution

- **Fixed Select Component Type Error**: Resolved TypeScript compilation error in account info dialog language selector
- **Improved Type Safety**: Added proper `SelectChangeEvent` type import from Material-UI
- **Enhanced Code Quality**: Eliminated type mismatches in Material-UI Select component usage

#### Technical Debt Reduction

- **Better Type Definitions**: Improved TypeScript type safety across the application
- **Cleaner Imports**: Optimized import statements for better code organization
- **Enhanced Developer Experience**: Reduced compilation errors and improved IDE support

---

_This changelog is automatically generated based on git commit history and may be updated as new changes are merged._
