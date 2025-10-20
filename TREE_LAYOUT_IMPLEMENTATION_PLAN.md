# Tree Layout Implementation Plan

## Overview

Implementation of a new vertical "tree" layout for mindmaps alongside the existing horizontal "mindmap" layout, with layout selection in the editor toolbar and persistence in the mindmap XML.

## Key Design Decisions

1. **Two layouts**: "mindmap" (current horizontal) and "tree" (new vertical)
2. **Tree layout characteristics**:
   - Vertical hierarchy: parent above, children below
   - Children arranged horizontally in a row at same depth level
   - Parent-centered children with no collisions (same principles as SYMMETRIC_SORTER)
   - Shrink connector at bottom center of parent, connecting to top of children
3. **Persistence**: Layout stored as attribute in mindmap XML
4. **Backward compatibility**: Existing maps default to "mindmap" layout
5. **Orientation propagation**: Orientation flows through topics (similar to theme variant pattern) - NO global variables

## Implementation Steps

### ✅ 1. Core Type Definitions

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/layout/LayoutType.ts` (new)

- Created `LayoutType` type with values: `'mindmap' | 'tree'`
- Created `OrientationType` type with values: `'horizontal' | 'vertical'`
- Created `LAYOUT_ORIENTATION` constant mapping layouts to orientations
- Exported types for use across packages

**Key Code**:

```typescript
export type LayoutType = 'mindmap' | 'tree';
export type OrientationType = 'horizontal' | 'vertical';
export const LAYOUT_ORIENTATION: Record<LayoutType, OrientationType> = {
  mindmap: 'horizontal',
  tree: 'vertical',
};
```

### ✅ 2. Mindmap Model Updates

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/model/Mindmap.ts`

- Added private `_layout: LayoutType` field (default: 'mindmap')
- Added `getLayout(): LayoutType` method
- Added `setLayout(layout: LayoutType): void` method
- Import: `import type { LayoutType } from '../layout/LayoutType'`

### ✅ 3. XML Serialization - Persist Layout

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/persistence/XMLSerializerTango.ts`

- In `toXML()` method: Added layout attribute persistence (always persisted)
- Import: `import type { LayoutType } from '../layout/LayoutType'`

**Key Code**:

```typescript
// Add layout - always persist
const layout = mindmap.getLayout();
mapElem.setAttribute('layout', layout);
```

**Correction**: Initially planned to only persist if not 'mindmap', but changed to always persist the layout attribute for consistency.

### ✅ 4. XML Deserialization - Load Layout

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/persistence/XMLSerializerTango.ts`

- In `loadFromDom()` method: Load layout attribute with 'mindmap' as default

**Key Code**:

```typescript
// Load layout attribute
const layoutAttr = rootElem.getAttribute('layout');
const layout = layoutAttr || 'mindmap'; // Default to mindmap
mindmap.setLayout(layout as LayoutType);
```

**File**: `packages/mindplot/src/components/persistence/XMLSerializerBeta.ts`

- In `loadFromDom()` method: Default to 'mindmap' layout for legacy maps

**Key Code**:

```typescript
// Beta version always uses mindmap layout
mindmap.setLayout('mindmap');
```

### ✅ 5. TreeSorter Implementation

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/layout/TreeSorter.ts` (new)

- Extends `AbstractBasicSorter`
- Implements vertical tree sorting with horizontal child distribution
- **Key characteristics**:
  - INTERNODE_VERTICAL_PADDING = 57 (generous vertical spacing between parent-child levels)
  - INTERNODE_HORIZONTAL_PADDING = 5 (minimal horizontal spacing between siblings)
  - Children positioned horizontally, centered under parent
  - All children at same vertical level (Y position)

**Key Methods**:

- `predict()`: Predicts position for drag-and-drop, determines order based on X coordinate
- `insert()`: Manages child ordering (shifts orders when inserting)
- `detach()`: Removes node and shifts remaining children
- `computeOffsets()`: Calculates horizontal offsets for children below parent
- `verify()`: Validates order consistency
- `getChildDirection()`: Returns 1 (always down in tree layout)
- `_computeChildrenWidth()`: Calculates horizontal space needed for node and descendants

### ✅ 6. Add Orientation to OriginalLayout

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/layout/OriginalLayout.ts`

- Added `getOrientation()` method returning `'horizontal'`
- Import: `import type { OrientationType } from './LayoutType'`

**Migration Support**:

- `migrateFromLayout()`: Migrates from tree layout ordering
- `_migrateNodeOrdering()`: Recursively fixes node ordering and sorter strategies
  - For root nodes: Converts continuous ordering to BalancedSorter even/odd ordering
  - For non-root nodes: Converts to SymmetricSorter continuous ordering
  - Updates all node sorter strategies appropriately
  - Redistributes children: first half to right (0, 2, 4...), second half to left (1, 3, 5...)

### ✅ 6b. TreeLayout Implementation

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/layout/TreeLayout.ts` (new)

- Similar structure to `OriginalLayout` but for vertical orientation
- Uses `TreeSorter` for all nodes (including root)
- `getOrientation()` returns `'vertical'`
- Main layout algorithm in `layout()` and `layoutChildren()` methods
- Static `TREE_SORTER` constant

**Key Differences from OriginalLayout**:

- No alignment offset calculations (simplified for tree)
- Children positioned directly below parents
- Uses width calculations instead of height for branch sizing

**Migration Support**:

- `migrateFromLayout()`: Migrates from mindmap layout ordering
- `_migrateNodeOrdering()`: Recursively fixes node ordering and sorter strategies
  - Converts BalancedSorter/SymmetricSorter ordering to TreeSorter continuous ordering
  - Updates all node sorter strategies to `TreeSorter`
  - Renumbers children sequentially (0, 1, 2, 3...)

### ✅ 7. LayoutManager Updates

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/layout/LayoutManager.ts`

- Added `private _mindmapLayout: OriginalLayout`
- Added `private _treeLayout: TreeLayout`
- Added `private _layoutType: LayoutType` field
- Updated constructor to accept optional `layoutType` parameter (default: 'mindmap')
- Added `_getCurrentLayout()` private method to return active layout
- Added `setLayoutType(layout: LayoutType)` method to switch layouts with migration
- Added `getLayoutType(): LayoutType` method
- Added `getOrientation(): OrientationType` method
- Updated all layout operations to use `this._getCurrentLayout()`
- **Removed**: Static orientation variable (uses instance method instead)

**Key Code**:

```typescript
private _getCurrentLayout(): OriginalLayout | TreeLayout {
  return this._layoutType === 'mindmap' ? this._mindmapLayout : this._treeLayout;
}

setLayoutType(layoutType: LayoutType): void {
  if (this._layoutType !== layoutType) {
    this._layoutType = layoutType;

    // Migrate node ordering when switching layouts
    if (layoutType === 'tree') {
      // Switching to tree: fix ordering gaps from BalancedSorter
      this._treeLayout.migrateFromLayout();
    } else if (layoutType === 'mindmap') {
      // Switching to mindmap: redistribute for balanced sorter
      this._mindmapLayout.migrateFromLayout();
    }

    // Trigger re-layout with new layout type
    this.layout(true);
  }
}
```

### ✅ 8. Designer Integration

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/Designer.ts`

- Added `setLayout(layout: LayoutType)` method:
  - Updates Mindmap model
  - Updates LayoutManager
  - Propagates orientation to all topics
  - Triggers full redraw
- Added `getLayout(): LayoutType` method
- Updated mindmap loading to read layout from XML
- Import: `import type { LayoutType } from './layout/LayoutType'`

**Key Code**:

```typescript
setLayout(layout: LayoutType): void {
  const mindmap = this.getMindmap();
  mindmap.setLayout(layout);

  const layoutManager = this._eventBussDispatcher.getLayoutManager();
  layoutManager.setLayoutType(layout);

  // Update orientation on all topics
  const orientation = layoutManager.getOrientation();
  this.getModel().getTopics().forEach((topic) => {
    topic.setOrientation(orientation);
  });

  // Redraw all topics
  this._canvas.enableQueueRender(false);
  this.getModel().getTopics().forEach((topic) => {
    topic.redraw(this.getThemeVariant(), true);
  });
  this._canvas.enableQueueRender(true);
}
```

### ✅ 9. Orientation Propagation Through Topics

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/Topic.ts`

- Added `private _orientation: OrientationType` field
- Updated constructor to accept `orientation: OrientationType = 'horizontal'` parameter
- Added `getOrientation(): OrientationType` method
- Added `setOrientation(orientation: OrientationType): void` method
- Import: `import type { OrientationType } from './layout/LayoutType'`

**File**: `packages/mindplot/src/components/TopicFactory.ts`

- Updated `create()` method to accept `orientation: OrientationType = 'horizontal'` parameter
- Passes orientation to CentralTopic and MainTopic constructors
- Import: `import type { OrientationType } from './layout/LayoutType'`

**File**: `packages/mindplot/src/components/Designer.ts`

- In `_buildNodeGraph()`: Gets orientation from LayoutManager and passes to TopicFactory

```typescript
const orientation = this._eventBussDispatcher.getLayoutManager().getOrientation();
const topic = TopicFactory.create(model, { readOnly }, this._themeVariant, orientation);
```

### ✅ 10. Connection Line & Shrink Connector Positioning

**Status**: COMPLETED

**File**: `packages/mindplot/src/components/ConnectionLine.ts`

- Updated `_getCtrlPoints()` method:
  - Gets orientation from target topic: `targetNode.getOrientation()`
  - For vertical orientation: Uses deltaY-based control points
  - For horizontal orientation: Uses deltaX-based control points (existing)
  - Handles THICK_CURVED_ORGANIC lines for both orientations

**Vertical Control Points**:

```typescript
if (orientation === 'vertical') {
  const deltaY = (srcPos.y - destPos.y) / 3;
  return [
    { x: 0, y: deltaY },
    { x: 0, y: -deltaY },
  ];
}
```

- Updated `_positionLine()` method:
  - Gets orientation from target topic
  - For vertical orientation: Positions connector at bottom center (x=0, y=height)
  - For horizontal orientation: Positions connector on left/right side (existing)

**Shrink Connector Positioning**:

```typescript
if (orientation === 'vertical') {
  x = 0; // centered horizontally
  y = targetTopicSize.height; // at bottom
  connector.setPosition(x, y);
}
```

### ✅ 11. AppBar Header - Layout Selector

**Status**: COMPLETED

**Initial Plan**: Add to editor toolbar
**Correction**: Moved to AppBar header after theme selection per user request

**File**: `packages/editor/src/components/action-widget/pane/layout-selector/index.tsx` (new)

- Created React component for layout selection
- Uses Material-UI RadioGroup with FormControlLabel
- Two options: "mindmap" and "tree" with descriptions
- Props: `closeModal` and `layoutModel: GenericValueModel<LayoutType>`
- Imports: Material-UI components (tree-shakeable imports)
- Calls `layoutModel.setValue()` on selection and closes modal

**File**: `packages/editor/src/components/app-bar/index.tsx`

- Added import: `import AccountTreeIcon from '@mui/icons-material/AccountTree'`
- Added import: `import LayoutSelector from '../action-widget/pane/layout-selector'`
- Created layout configuration ActionConfig (positioned after theme editor):
  - Icon: `<AccountTreeIcon />`
  - Tooltip: "Change Layout"
  - Renders LayoutSelector component
  - Uses `modelBuilder.getLayoutModel()`
  - Visibility controlled by: `!capability.isHidden('layout')`
- Added to AppBar configuration array (line 405-422)

**File**: `packages/editor/src/classes/model/node-property-builder/index.ts`

- Added `getLayoutModel()` method:

```typescript
getLayoutModel(): NodeProperty<'mindmap' | 'tree'> {
  return {
    getValue: () => this.designer.getLayout(),
    setValue: (value: 'mindmap' | 'tree') => this.designer.setLayout(value),
  };
}
```

### ✅ 12. Internationalization

**Status**: COMPLETED

**File**: `packages/editor/lang/en.json`

- Added translation keys:
  - `appbar.tooltip-change-layout`: "Change Layout" (for AppBar)
  - `editor-panel.tooltip-change-layout`: "Change Layout" (legacy, if needed)
  - `layout-selector.description`: "Choose layout style"
  - `layout-selector.mindmap`: "Mindmap"
  - `layout-selector.mindmap-description`: "Horizontal layout with balanced branches"
  - `layout-selector.tree`: "Tree"
  - `layout-selector.tree-description`: "Vertical hierarchy flowing top-to-bottom"

### ✅ 13. Type Exports

**Status**: COMPLETED

**File**: `packages/mindplot/src/index.ts`

- Added exports:

```typescript
export type { LayoutType, OrientationType } from './components/layout/LayoutType';
```

### ✅ 14. Linting & Code Quality

**Status**: COMPLETED

- Fixed all trailing spaces
- Fixed unused parameter errors (prefixed with underscore)
- Fixed multiple empty lines at end of files
- All code passes ESLint with zero errors
- Follows repository coding standards

## Files Created

1. ✅ `packages/mindplot/src/components/layout/LayoutType.ts` - Type definitions
2. ✅ `packages/mindplot/src/components/layout/TreeSorter.ts` - Tree sorting strategy (217 lines)
3. ✅ `packages/mindplot/src/components/layout/TreeLayout.ts` - Tree layout implementation (168 lines)
4. ✅ `packages/mindplot/src/components/commands/ChangeLayoutCommand.ts` - Command for undo/redo (70 lines)
5. ✅ `packages/mindplot/src/components/BaseConnectionLine.ts` - Base class for all connection lines (147 lines)
6. ✅ `packages/mindplot/src/components/TopicConnection.ts` - Hierarchical parent-child connections (273 lines)
7. ✅ `packages/editor/src/components/action-widget/pane/layout-selector/index.tsx` - UI component (95 lines)

## Files Refactored

1. ✅ `packages/mindplot/src/components/ConnectionLine.ts` - Now re-exports TopicConnection for backward compatibility

## Files Modified

### Mindplot Package (15 files)

1. ✅ `packages/mindplot/src/components/model/Mindmap.ts` - Layout property
2. ✅ `packages/mindplot/src/components/persistence/XMLSerializerTango.ts` - Serialization
3. ✅ `packages/mindplot/src/components/persistence/XMLSerializerBeta.ts` - Legacy support
4. ✅ `packages/mindplot/src/components/layout/OriginalLayout.ts` - Orientation method + migration
5. ✅ `packages/mindplot/src/components/layout/LayoutManager.ts` - Multi-layout support + migration
6. ✅ `packages/mindplot/src/components/layout/Node.ts` - Added setSorter() method
7. ✅ `packages/mindplot/src/components/commands/ChangeLayoutCommand.ts` - Command pattern implementation
8. ✅ `packages/mindplot/src/components/StandaloneActionDispatcher.ts` - changeLayout() method
9. ✅ `packages/mindplot/src/components/Designer.ts` - changeLayout() and applyLayout() methods
10. ✅ `packages/mindplot/src/components/Topic.ts` - Orientation property
11. ✅ `packages/mindplot/src/components/TopicFactory.ts` - Orientation parameter
12. ✅ `packages/mindplot/src/components/ConnectionLine.ts` - Variable renaming + orientation-aware rendering
13. ✅ `packages/mindplot/src/components/MainTopic.ts` - Orientation-aware connection points
14. ✅ `packages/mindplot/src/components/CentralTopic.ts` - Orientation-aware connection points
15. ✅ `packages/mindplot/src/index.ts` - Type exports

### Editor Package (3 files)

1. ✅ `packages/editor/src/components/app-bar/index.tsx` - AppBar integration (layout selector after theme)
2. ✅ `packages/editor/src/classes/model/node-property-builder/index.ts` - Layout model
3. ✅ `packages/editor/lang/en.json` - Translations

## Key Technical Decisions & Corrections

### 1. Orientation Propagation Pattern

**Initial Plan**: Use global static variable in LayoutManager
**Correction**: Use instance property on each Topic (like ThemeVariant)
**Rationale**: Cleaner architecture, no global state, follows existing patterns

### 2. TreeSorter Strategy

**Decision**: Create new sorter instead of reusing SYMMETRIC_SORTER
**Rationale**: Different positioning logic needed for vertical layout

### 3. Type Safety

**Implementation**: All inline union types replaced with proper type aliases
**Result**: `OrientationType` used consistently throughout codebase

### 4. Backward Compatibility

**Implementation**:

- Maps without layout attribute default to 'mindmap'
- Beta version maps explicitly set to 'mindmap'
- Layout attribute always persisted in XML (for consistency)

### 5. Layout Selector Location

**Initial Plan**: Editor toolbar
**Correction**: AppBar header after theme selection (better UX, less clutter)

### 6. Layout Migration & Node Ordering

**Issue Discovered**: BalancedSorter uses gaps in ordering (0, 2, 4 for right, 1, 3, 5 for left), but TreeSorter requires continuous ordering (0, 1, 2, 3...)
**Solution Implemented**:

- Added `migrateFromLayout()` method to both TreeLayout and OriginalLayout
- Added `setSorter()` method to Node class
- Migration automatically called when switching layouts in LayoutManager
- TreeLayout migration: Converts gap ordering to continuous, updates all sorters to TreeSorter
- OriginalLayout migration: Converts continuous to gap ordering, updates sorters to BalancedSorter/SymmetricSorter
- Migration is recursive, fixing all descendants

### 7. Connection Line Variable Naming & Connector Position Fix

**Issue Discovered**: Variables named `_sourceTopic`/`_targetTopic` were confusing. Connectors were not properly centered in tree layout.
**Solution Implemented**:

- **ConnectionLine.ts**: Renamed internal variables for clarity:
  - `_targetTopic` → `_parentTopic` (the parent in parent-child relationship)
  - `_sourceTopic` → `_childTopic` (the child connecting to parent)
  - Constructor parameters renamed: `childTopic`, `parentTopic`
  - Primary API: `getParentTopic()` and `getChildTopic()` methods
  - Kept `getSourceTopic()` and `getTargetTopic()` as aliases for Relationship class compatibility
  - Updated all internal references to use new variable names
  - Updated parameter names in `_getCtrlPoints()` and `_positionLine()`
- **Designer.ts**: Updated to use `getParentTopic()` and `getChildTopic()`
- **Topic.ts**: Updated parent-child connection calls to use `getParentTopic()`
- **MainTopic.ts**: Added orientation-aware connection points:
  - `workoutIncomingConnectionPoint()`: Returns BOTTOM center for vertical (parent receives from below)
  - `workoutOutgoingConnectionPoint()`: Returns TOP center for vertical (child connects from top)
- **CentralTopic.ts**: Added orientation-aware connection points:
  - `workoutIncomingConnectionPoint()`: Returns BOTTOM center for vertical layout
- **Result**:
  - Connectors properly positioned at **bottom center** of parent nodes
  - Connection lines connect from **top center** of child nodes
  - Variable names are self-documenting (parent/child vs source/target)
  - Relationship class continues to use source/target terminology (more appropriate for arbitrary connections)

### 8. Command Pattern for Undo/Redo

**Issue Discovered**: Layout changes were not using command pattern, preventing undo/redo and proper save behavior
**Solution Implemented**:

- Created `ChangeLayoutCommand` class (similar to ChangeThemeCommand)
- Added `changeLayout()` method to StandaloneActionDispatcher
- Renamed Designer.setLayout() to `applyLayout()` (internal use only)
- Added Designer.`changeLayout()` (public API using command)
- Updated node-property-builder to call `changeLayout()` instead of `setLayout()`
- Result: Layout changes are now undoable and trigger proper save behavior

### 9. Class Hierarchy Refactoring (ConnectionLine → TopicConnection)

**Issue Discovered**: ConnectionLine served two purposes: hierarchical connections and arbitrary relationships, causing confusion
**Solution Implemented**:

- Created `BaseConnectionLine` abstract class:
  - Contains common line rendering logic
  - Abstract methods: `getLineWidth()`, `getLineWidthOrganic()`, `createArcLine()`
  - Deferred line creation to child classes via `initializeLine()`
  - Common methods: `setVisibility()`, `setOpacity()`, `addToWorkspace()`, etc.
- Created `TopicConnection` class (new name for hierarchical connections):
  - Extends `BaseConnectionLine`
  - Uses `_parentTopic` and `_childTopic` (clear parent-child semantics)
  - Methods: `getParentTopic()`, `getChildTopic()`
  - Handles orientation-aware connection points and connector positioning
- Refactored `Relationship` class:
  - Now extends `BaseConnectionLine` directly (not through ConnectionLine)
  - Uses `_sourceTopic` and `_targetTopic` (arbitrary connection semantics)
  - Methods: `getSourceTopic()`, `getTargetTopic()`
  - Implements its own abstract methods
  - Removed `_positionLine()` call (relationships don't have shrink connectors)
  - Overrides `addToWorkspace()` to ensure relationships render behind topics
- Refactored `TopicConnection` class:
  - Overrides `addToWorkspace()` to call `moveToBack()` ensuring connections render behind topics
  - Fixed shrink connector positioning in vertical layout: now perfectly centered at `x = parentTopicSize.width / 2 - offset` (accounting for connector width)
  - Overrides `initializeLine()` to set orientation on PolyLine instances
  - Updates PolyLine orientation in `redraw()` when layout changes
- Updated `ConnectionLine.ts` to re-export `TopicConnection` for backward compatibility
- Updated all references in:
  - `Topic.ts`: Uses `TopicConnection` type
  - `Designer.ts`: Uses `getParentTopic()`, `getChildTopic()`
  - Other files maintain compatibility through re-export

**Phase 9: PolyLine Orientation Support (web2d)**

Added orientation support to PolyLine for vertical tree layout:

- **PolyLinePeer.ts** (web2d):
  - Added `_orientation` property ('horizontal' | 'vertical')
  - Added `setOrientation()` and `getOrientation()` methods
  - Updated `_updateStraightPath()` to use orientation-specific path generation
  - Updated `_updateMiddleStraightPath()` for vertical layout (goes down → horizontal → down)
  - Updated `_updateMiddleCurvePath()` for vertical layout with curved transitions
  - Updated `_updateCurvePath()` to use orientation-specific path generation

- **PolyLineUtils.ts** (web2d):
  - Added `buildVerticalStraightPath()`: creates vertical-first path segments
  - Added `buildVerticalCurvedPath()`: creates vertical-first curved path segments

- **PolyLine.ts** (web2d):
  - Exposed `setOrientation()` and `getOrientation()` methods

**Behavior:**

- Horizontal orientation (mindmap): line goes horizontal → vertical → horizontal
- Vertical orientation (tree): line goes vertical → horizontal → vertical
- Breakpoint is at 50% (middle) of the space between parent and child for both orientations
- Horizontal segments in vertical layout remain truly horizontal (same Y coordinate throughout)

**Phase 10: DragPivot Orientation Support**

Updated DragPivot to support vertical tree layout during drag operations:

- **DragPivot.ts**:
  - Modified `_redrawLine()` to detect parent topic orientation
  - For vertical orientation: connection point at top center of pivot (`y = position.y - size.height / 2`)
  - For horizontal orientation: connection point at left or right side (existing logic)
  - Updated control points for both straight and curved lines based on orientation
  - Vertical: control points use Y deltas (`deltaY / 3`)
  - Horizontal: control points use X deltas (`deltaX / 3`)

**Result:**

- Drag preview lines now connect from top center of pivot in tree layout
- Lines properly centered on the drag pivot rectangle
- Control points ensure smooth curves in correct direction

**Phase 11: ArcLine Orientation Support**

Updated ArcLine to support vertical tree layout with proper concave direction:

- **ArcLinePeer.ts** (web2d):
  - Added `_orientation` property ('horizontal' | 'vertical')
  - Added `setOrientation()` and `getOrientation()` methods
  - Updated `_updatePath()` to calculate control points based on orientation
  - Vertical: curves horizontally (concave in X direction) - control points adjust X
  - Horizontal: curves vertically (concave in Y direction) - control points adjust Y

- **ArcLine.ts** (web2d):
  - Exposed `setOrientation()` and `getOrientation()` methods

- **TopicConnection.ts**:
  - Updated `initializeLine()` to set orientation on ArcLine instances
  - Updated `redraw()` to update ArcLine orientation when layout changes

- **ArcLine.ts** (mindplot model):
  - Updated `setFrom()` to adjust position based on orientation
  - Vertical: adjusts Y offset to avoid connector overlap
  - Horizontal: adjusts X offset to avoid connector overlap

**Result:**

- Arc lines now curve in the correct direction for tree layout
- Vertical tree: arcs curve outward horizontally (concave in X)
- Horizontal mindmap: arcs curve outward vertically (concave in Y)
- No overlap with shrink connectors in both orientations

**Phase 12: Compact Vertical Spacing**

Reduced vertical spacing between children in tree layout:

- **TreeSorter.ts**:
  - Changed `INTERNODE_VERTICAL_PADDING` from 50 to 25 (reduced to half)
  - Creates more compact tree layout with less whitespace
  - Maintains readability while maximizing screen usage

**Result:**

- Tree layout is now more compact vertically
- Better use of screen space
- Reduces need for scrolling in large trees

**Phase 13: Layout Selector UI (Modal-based, Similar to Theme Selector)**

Kept modal-based layout selector consistent with theme editor UI:

- **LayoutSelector Component** (packages/editor/src/components/action-widget/pane/layout-selector/index.tsx):
  - Dialog modal with Card-based selection (identical pattern to ThemeEditor)
  - Options for 'mindmap' and 'tree' layouts
  - Each card includes:
    - Large custom icon (MindmapIcon SVG for mindmap, AccountTreeIcon for tree)
    - Layout name (title)
    - Descriptive text explaining use case
  - Custom MindmapIcon: SVG showing central node with branches on both sides
  - Selected card highlighted with blue border
  - Hover effect on cards
  - Accept/Cancel buttons at bottom
  - Uses NodeProperty<LayoutType> for model (consistent with ThemeEditor)

- **AppBar Integration**:
  - Layout selector opens as modal (like theme editor)
  - AccountTreeIcon button in toolbar
  - Uses `options` pattern with `render` function
  - Tooltip: "Layout"

- **ActionType Updates**:
  - Added 'layout' to ActionType enum for capability management

- **WidgetBuilder Fix**:
  - Added null check for `mindmap-comp` element and `shadowRoot`
  - Prevents crashes when tooltip is created before DOM is ready
  - Console warning instead of error

**Result:**

- Layout selector UI matches theme selector pattern
- Modal-based selection for consistency
- RadioGroup with descriptions for each layout option
- Clean, professional UI

**Benefits**:

- Clear separation of concerns (hierarchical vs arbitrary connections)
- Self-documenting variable names (parent/child vs source/target)
- Reduced code duplication
- Backward compatible through re-export

## Testing Checklist

### ⏳ Manual Testing (TO DO)

- [ ] Create new mindmap and switch between layouts
- [ ] Save and reload maps with tree layout
- [ ] Test shrink/expand in tree layout
- [ ] Test drag-and-drop in tree layout
- [ ] Verify collision detection
- [ ] Test with existing maps (backward compatibility)
- [ ] Test layout switching on large maps
- [ ] Test with different themes
- [ ] Test connection line curves in both layouts
- [ ] Test shrink connector positioning

### ⏳ Automated Testing (TO DO)

- [ ] Unit tests for TreeSorter
- [ ] Unit tests for TreeLayout
- [ ] Integration tests for layout switching
- [ ] XML serialization/deserialization tests
- [ ] Orientation propagation tests

## Future Enhancements (Not Implemented)

1. **Layout Migration Logic**: Automatically reorder nodes when switching layouts for optimal appearance
2. **Visual Transitions**: Animated transitions when switching layouts
3. **Keyboard Shortcuts**: Quick layout switching (e.g., Ctrl+Shift+L)
4. **Layout Templates**: Predefined layout styles (e.g., org chart, family tree)
5. **Mixed Layouts**: Different layouts for different branches
6. **Auto Layout Detection**: Suggest layout based on mind map structure
7. **Additional Layouts**: Radial, fishbone, timeline layouts

## Known Limitations

1. **Relationship Lines**: Relationship control points use Shape.calculateDefaultControlPoints() which auto-detects orientation - works but not specifically optimized for tree layout
2. **Large Maps**: Performance not yet tested on very large mind maps with many nodes
3. **Mobile**: Touch gestures for layout switching not yet implemented
4. **Undo/Redo**: Layout changes are included in undo/redo but not tested extensively

## Completion Status

**Overall Progress**: 9/10 todos complete (90%)

✅ **Completed** (9):

1. Type definitions & Mindmap model
2. XML persistence
3. TreeSorter implementation
4. TreeLayout implementation
5. LayoutManager updates
6. Designer integration
7. Connection line & connector positioning
8. Editor UI integration
9. Internationalization

⏳ **Pending** (1): 10. Testing (manual and automated)

**Code Quality**: ✅ All linting passing, zero errors

**Documentation**: ✅ This plan document

**Ready for**: Manual testing and QA review
