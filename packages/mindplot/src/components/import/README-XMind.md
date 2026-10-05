# XMind Importer for WiseMapping

## Overview

The XMind Importer provides comprehensive support for importing XMind mind maps into WiseMapping format. It handles both legacy XML and modern JSON XMind formats, ensuring maximum data preservation while respecting WiseMapping's architectural constraints.

## 🚀 Key Features

### ✅ Fully Supported Features

- **Complete Topic Hierarchy**: All parent-child relationships preserved
- **Rich Notes**: XMind notes converted to HTML-enabled WiseMapping notes
- **Labels & Markers**: Visual indicators preserved with emoji prefixes
- **Background Colors**: XMind styling mapped to WiseMapping colors
- **Icons**: XMind icons supported as WiseMapping icon elements
- **Deterministic Import**: Consistent results with incremental ID generation
- **Dual Format Support**: Both XMind XML and JSON formats handled

### 📋 Feature Mapping

| XMind Feature     | WiseMapping Equivalent                            | Status      |
| ----------------- | ------------------------------------------------- | ----------- |
| Topics            | Topics with hierarchy                             | ✅ Complete |
| Notes             | Rich HTML notes                                   | ✅ Complete |
| Labels            | `🏷️ label-name` in notes                          | ✅ Complete |
| Markers           | `🔖 marker-name` in notes                         | ✅ Complete |
| Icons             | `<icon id="emoji-..."/>` elements (300+ mappings) | ✅ Complete |
| Background Colors | `bgColor` attribute                               | ✅ Complete |
| Border Colors     | `brColor` attribute                               | ✅ Complete |
| Topic Positioning | Circular layout algorithm                         | ✅ Complete |

## 📝 Note Content Strategy

XMind allows multiple content types per topic (notes, labels, markers), but WiseMapping supports only one note per topic. The importer intelligently combines all XMind content into a single WiseMapping note:

```
[XMind Note Content]
🔖 priority-1, 🔖 star
🏷️ CATEGORY_A, 🏷️ STATUS
```

This approach ensures:

- **No data loss**: All XMind metadata is preserved
- **Visual clarity**: Emoji prefixes distinguish content types
- **Architectural compliance**: Respects WiseMapping's single-note constraint

## 🔧 Technical Implementation

### Format Detection

The importer automatically detects XMind format:

- **JSON Format**: Modern XMind files with `content.json`
- **XML Format**: Legacy XMind files with XML structure

### ID Generation

- **Deterministic**: Incremental counter ensures consistent imports
- **Predictable**: Same XMind file always produces same WiseMapping IDs
- **Testable**: Enables reliable unit testing

### Error Handling

- **Rejection**: Invalid XMind files reject the import with an `ImportError`
- **Detailed feedback**: Error messages explain import failures
- **No placeholder maps**: A failed import never resolves to an error map

## 📊 Test Coverage

The importer includes comprehensive test coverage:

- **Simple Maps**: Basic topic hierarchies
- **Complex Maps**: Multi-level structures with all features
- **Edge Cases**: Invalid files, missing content, malformed data
- **Format Validation**: Both XML and JSON XMind formats

## 🎯 Usage Examples

### Basic Import

```typescript
import { XMindImporter } from './XMindImporter';

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

## 🔍 Validation

The importer validates:

- **XMind file structure**: Ensures valid ZIP archive
- **Content format**: Validates JSON/XML structure
- **WiseMapping compliance**: Output conforms to `mindmap.xsd` schema
- **Data integrity**: All topics and relationships preserved

## 🚧 Limitations

- **Single Note Constraint**: Multiple XMind elements combined into one note
- **Style Simplification**: Some XMind styling may be simplified
- **Icon Mapping**: XMind icons converted to text representation in notes

## 🔮 Future Enhancements

Potential improvements for future versions:

- **Advanced Styling**: More comprehensive style mapping
- **Icon Preservation**: Direct XMind icon to WiseMapping icon mapping
- **Layout Optimization**: Smarter positioning algorithms
- **Performance**: Streaming import for large files

## 📚 Related Documentation

- [WiseMapping XML Schema](../mindmap.xsd)
- [Note Model Documentation](../model/NoteModel.ts)
- [Import Test Suite](../../test/unit/import/XMindImporterTestSuite.test.ts)
