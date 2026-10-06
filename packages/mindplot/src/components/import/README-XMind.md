# XMind Importer for WiseMapping

## Overview

The XMind Importer converts XMind mind maps into WiseMapping maps. It reads both formats XMind writes: the JSON one (`content.json`, XMind Zen and later) and the legacy XML one (`content.xml`, XMind 8 and earlier).

## 🚀 Key Features

### ✅ Supported Features

- **Topic Hierarchy**: Attached topics keep their parent-child relationships; detached topics become floating topics at their XMind position
- **Notes**: The plain text of XMind notes (`notes.plain.content`, `<notes><plain>`) becomes a plain text WiseMapping note
- **Labels**: JSON labels are added to the note as `🏷️ label-name`
- **Markers**: XMind markers become WiseMapping icons (see [Icons](#-icons))
- **Links**: Topic hyperlinks become links; links to a topic of the file (`xmind:#id`) or to an attachment (`xap:`) are skipped
- **Relationships**: Relationships between two imported topics are kept
- **Layout**: Tree-like structures (org chart, tree, timeline, logic, fishbone, matrix) import as a tree map, the others as a mind map
- **Deterministic Import**: Consistent results with incremental ID generation

### 📋 Feature Mapping

| XMind Feature                     | WiseMapping Equivalent                      | Format    |
| --------------------------------- | ------------------------------------------- | --------- |
| Topics                            | Topics with hierarchy                       | JSON, XML |
| Detached topics                   | Floating topics                             | JSON, XML |
| Notes                             | Plain text note                             | JSON, XML |
| Labels                            | `🏷️ label-name` in the note                 | JSON      |
| Markers (`markers`/`marker-refs`) | `<eicon>` emoji icons or `<icon>` SVG icons | JSON, XML |
| Hyperlinks (`href`)               | Links                                       | JSON, XML |
| Relationships                     | Relationships                               | JSON, XML |
| Fill color (`svg:fill`)           | Background and border color                 | JSON      |
| Structure class                   | `mindmap` or `tree` layout                  | JSON, XML |

## 🎨 Icons

XMind markers are imported with two tables of `XMindImporter.ts`, keyed by the marker ids of [xmind-sdk-js](https://github.com/xmindltd/xmind-sdk-js) (`src/common/constants/marker.ts`, the hidden ones included), which XMind 8 and XMind Zen write. Ids are matched case-insensitively.

- **`XMIND_MARKER_SVG_ICONS`**: the markers imported as a WiseMapping SVG icon (`<icon>`):
  - the task progress (`task-start` ... `task-done`), as the `task_0` ... `task_100` icons, at the quarter at or below it, so that only a done task looks done;
  - the colored flags, as the `flag_*` icons (dark green and dark blue as green and blue);
  - the pie chart (`c_symbol_pie_chart`), as `chart_pie`.
- **`XMIND_MARKER_EMOJIS`**: the emoji of every other marker (`<eicon>`): priorities, smileys, task, flags, stars, half stars, people, arrows, symbols (with the `c_symbol_` and `c_simbol-` ids of XMind Zen), months, weekdays and the other markers. The priorities use the colors MindManager's are imported as.

All 158 marker ids are mapped but `c_symbol_apostrophe`, which has no emoji: it, and any id that is not an XMind marker, imports as a light bulb (💡).

In the XML format, `<markers><marker marker-id>` elements of a topic, which XMind does not write (its markers are `<marker-refs>`), are only added to the note as `🔖 marker-id`.

## 📝 Note Content Strategy

WiseMapping supports one note per topic, so the XMind note and the labels of a JSON topic are combined into a single note:

```
[XMind Note Content]
🏷️ CATEGORY_A, 🏷️ STATUS
```

## 🔧 Technical Implementation

### Format Detection

The importer accepts an XMind file (a ZIP archive) or the content itself:

- **ZIP archive**: `content.json` is read if present, else `content.xml`. Only these entries are inflated, and an archive whose content exceeds 50 MB uncompressed is rejected.
- **JSON content**: an array of sheets, an object with `sheets`, or a single sheet. The first sheet with a root topic is imported.
- **XML content**: an `<xmap-content>` document. The first sheet is imported.

### ID Generation

- **Deterministic**: Incremental counter ensures consistent imports
- **Predictable**: Same XMind file always produces same WiseMapping IDs
- **Testable**: Enables reliable unit testing

### Error Handling

- **Rejection**: Invalid XMind files reject the import with an `ImportError`
- **Detailed feedback**: Error messages explain import failures
- **No placeholder maps**: A failed import never resolves to an error map

## 📊 Test Coverage

- [XMindImporterTestSuite](../../../test/unit/import/XMindImporterTestSuite.test.ts): the input files of `test/unit/import/input/xmind`, against their expected WiseMapping maps
- [XMindImporterContent](../../../test/unit/import/XMindImporterContent.test.ts): notes, labels, icons, links and floating topics of both formats
- [XMindIconMappingTest](../../../test/unit/import/XMindIconMappingTest.test.ts): the marker tables against the 158 real marker ids
- [XMindImporterInputs](../../../test/unit/import/XMindImporterInputs.test.ts) and [XMindImporterZipLimits](../../../test/unit/import/XMindImporterZipLimits.test.ts): input detection and archive limits

## 🎯 Usage Examples

### Basic Import

```typescript
import XMindImporter from './XMindImporter';

const xmindContent = fs.readFileSync('my-map.xmind');
const importer = new XMindImporter(xmindContent);
const wisemappingXML = await importer.import('My Map', 'Description');
```

### Error Handling

```typescript
try {
  const result = await importer.import('Map Name', 'Description');
  // Success: result contains valid WiseMapping XML
} catch (error) {
  // Error: an ImportError whose message can be shown to the user
  console.error('Import failed:', error.message);
}
```

## 🚧 Limitations

- **One sheet**: Only one sheet of a multi-sheet file is imported
- **Single Note Constraint**: The note and the labels are combined into one note; rich text notes import as their plain text
- **Style Simplification**: Only the fill color of JSON topics is imported; the other topics use the line shape, and the map the prism theme
- **Positions**: Attached topics are laid out again; only floating topics keep their XMind position
- **Not imported**: Labels of the XML format, boundaries, summaries, images, numbering and relationship titles

## 📚 Related Documentation

- [Note Model](../model/NoteModel.ts)
