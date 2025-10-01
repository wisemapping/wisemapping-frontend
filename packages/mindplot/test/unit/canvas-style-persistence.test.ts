/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import Mindmap from '../../src/components/model/Mindmap';
import Designer from '../../src/components/Designer';
import XMLSerializerTango from '../../src/components/persistence/XMLSerializerTango';

// Mock dependencies
jest.mock('../../src/components/ScreenManager');
jest.mock('../../src/components/Designer');
jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    setCoordOrigin: jest.fn(),
    setCoordSize: jest.fn(),
    getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
    getSVGElement: jest.fn().mockReturnValue({
      parentElement: {
        parentElement: {
          setAttribute: jest.fn(),
        },
      },
    }),
  })),
}));

// Mock jQuery
(global as any).$ = jest.fn(() => ({
  css: jest.fn().mockReturnValue('1000'),
  width: jest.fn().mockReturnValue(1000),
  height: jest.fn().mockReturnValue(800),
  position: jest.fn().mockReturnValue({ left: 0, top: 0 }),
  find: jest.fn().mockReturnValue({
    attr: jest.fn(),
  }),
}));

describe('Canvas Style Persistence Tests', () => {
  describe('Mindmap Canvas Style Methods', () => {
    let mindmap: Mindmap;

    beforeEach(() => {
      mindmap = new Mindmap('test-map');
    });

    test('should return undefined for canvas style initially', () => {
      expect(mindmap.getCanvasStyle()).toBeUndefined();
    });

    test('should set and get canvas style correctly', () => {
      const canvasStyle = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'grid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };

      mindmap.setCanvasStyle(canvasStyle);

      expect(mindmap.getCanvasStyle()).toEqual(canvasStyle);
    });

    test('should update canvas style correctly', () => {
      const initialStyle = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'grid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };

      const updatedStyle = {
        backgroundColor: '#ffffff',
        backgroundPattern: 'dots' as const,
        gridSize: 25,
        gridColor: '#cccccc',
      };

      mindmap.setCanvasStyle(initialStyle);
      mindmap.setCanvasStyle(updatedStyle);

      expect(mindmap.getCanvasStyle()).toEqual(updatedStyle);
      expect(mindmap.getCanvasStyle()).not.toEqual(initialStyle);
    });

    test('should handle all background pattern types', () => {
      const patterns = ['solid', 'grid', 'dots', 'none'] as const;

      patterns.forEach((pattern) => {
        const style = {
          backgroundColor: '#f2f2f2',
          backgroundPattern: pattern,
          gridSize: 50,
          gridColor: '#ebe9e7',
        };

        mindmap.setCanvasStyle(style);
        expect(mindmap.getCanvasStyle()?.backgroundPattern).toBe(pattern);
      });
    });
  });

  describe('Designer Canvas Style Methods', () => {
    let designer: Designer;

    beforeEach(() => {
      // Mock Designer with minimal setup
      designer = {
        getMindmap: jest.fn().mockReturnValue({
          setCanvasStyle: jest.fn(),
          getCanvasStyle: jest.fn(),
        }),
        setCanvasStyle: jest.fn(),
      } as any;
    });

    test('should apply solid background style correctly', () => {
      const style = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'solid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };

      // Mock the actual setCanvasStyle implementation
      const mockMindmap = {
        setCanvasStyle: jest.fn(),
      };
      (designer.getMindmap as jest.Mock).mockReturnValue(mockMindmap);

      // Create a real Designer instance for testing
      const realDesigner = new Designer({
        divContainer: document.createElement('div'),
        mode: 'edition-owner',
        widgetManager: {} as any,
        persistenceManager: {} as any,
        zoom: 1,
        locale: 'en',
      });

      realDesigner.setCanvasStyle(style);

      expect(mockMindmap.setCanvasStyle).toHaveBeenCalledWith(style);
    });

    test('should apply grid background style correctly', () => {
      const style = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'grid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };

      const mockMindmap = {
        setCanvasStyle: jest.fn(),
      };
      (designer.getMindmap as jest.Mock).mockReturnValue(mockMindmap);

      const realDesigner = new Designer({
        divContainer: document.createElement('div'),
        mode: 'edition-owner',
        widgetManager: {} as any,
        persistenceManager: {} as any,
        zoom: 1,
        locale: 'en',
      });

      realDesigner.setCanvasStyle(style);

      expect(mockMindmap.setCanvasStyle).toHaveBeenCalledWith(style);
    });

    test('should apply dots background style correctly', () => {
      const style = {
        backgroundColor: '#ffffff',
        backgroundPattern: 'dots' as const,
        gridSize: 25,
        gridColor: '#cccccc',
      };

      const mockMindmap = {
        setCanvasStyle: jest.fn(),
      };
      (designer.getMindmap as jest.Mock).mockReturnValue(mockMindmap);

      const realDesigner = new Designer({
        divContainer: document.createElement('div'),
        mode: 'edition-owner',
        widgetManager: {} as any,
        persistenceManager: {} as any,
        zoom: 1,
        locale: 'en',
      });

      realDesigner.setCanvasStyle(style);

      expect(mockMindmap.setCanvasStyle).toHaveBeenCalledWith(style);
    });
  });

  describe('XML Serialization Tests', () => {
    let serializer: XMLSerializerTango;
    let mindmap: Mindmap;

    beforeEach(() => {
      serializer = new XMLSerializerTango();
      mindmap = new Mindmap('test-map');
    });

    test('should serialize canvas style to XML correctly', () => {
      const canvasStyle = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'grid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };

      mindmap.setCanvasStyle(canvasStyle);

      const xmlDoc = serializer.toXML(mindmap);
      const mapElement = xmlDoc.documentElement;

      expect(mapElement.hasAttribute('canvasStyle')).toBe(true);

      const serializedStyle = JSON.parse(mapElement.getAttribute('canvasStyle')!);
      expect(serializedStyle).toEqual(canvasStyle);
    });

    test('should not serialize canvas style when undefined', () => {
      // Don't set any canvas style
      const xmlDoc = serializer.toXML(mindmap);
      const mapElement = xmlDoc.documentElement;

      expect(mapElement.hasAttribute('canvasStyle')).toBe(false);
    });

    test('should deserialize canvas style from XML correctly', () => {
      const canvasStyle = {
        backgroundColor: '#ffffff',
        backgroundPattern: 'dots' as const,
        gridSize: 25,
        gridColor: '#cccccc',
      };

      // Create XML with canvas style
      const xmlDoc = document.implementation.createDocument('', '');
      const mapElement = xmlDoc.createElement('map');
      mapElement.setAttribute('name', 'test-map');
      mapElement.setAttribute('canvasStyle', JSON.stringify(canvasStyle));
      xmlDoc.appendChild(mapElement);

      const loadedMindmap = serializer.loadFromDom(xmlDoc, 'test-map');

      expect(loadedMindmap.getCanvasStyle()).toEqual(canvasStyle);
    });

    test('should handle malformed canvas style gracefully', () => {
      // Create XML with malformed canvas style
      const xmlDoc = document.implementation.createDocument('', '');
      const mapElement = xmlDoc.createElement('map');
      mapElement.setAttribute('name', 'test-map');
      mapElement.setAttribute('canvasStyle', 'invalid-json');
      xmlDoc.appendChild(mapElement);

      // Mock console.warn to verify error handling
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const loadedMindmap = serializer.loadFromDom(xmlDoc, 'test-map');

      expect(loadedMindmap.getCanvasStyle()).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse canvas style:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('should handle missing canvas style attribute gracefully', () => {
      // Create XML without canvas style attribute
      const xmlDoc = document.implementation.createDocument('', '');
      const mapElement = xmlDoc.createElement('map');
      mapElement.setAttribute('name', 'test-map');
      xmlDoc.appendChild(mapElement);

      const loadedMindmap = serializer.loadFromDom(xmlDoc, 'test-map');

      expect(loadedMindmap.getCanvasStyle()).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    test('should persist canvas style through full save/load cycle', () => {
      const serializer = new XMLSerializerTango();

      // Create and configure mindmap
      const originalMindmap = new Mindmap('test-map');
      const canvasStyle = {
        backgroundColor: '#f2f2f2',
        backgroundPattern: 'grid' as const,
        gridSize: 50,
        gridColor: '#ebe9e7',
      };
      originalMindmap.setCanvasStyle(canvasStyle);

      // Serialize to XML
      const xmlDoc = serializer.toXML(originalMindmap);

      // Deserialize from XML
      const loadedMindmap = serializer.loadFromDom(xmlDoc, 'test-map');

      // Verify canvas style is preserved
      expect(loadedMindmap.getCanvasStyle()).toEqual(canvasStyle);
    });

    test('should handle canvas style with different grid sizes', () => {
      const serializer = new XMLSerializerTango();
      const gridSizes = [25, 50, 75, 100];

      gridSizes.forEach((gridSize) => {
        const originalMindmap = new Mindmap(`test-map-${gridSize}`);
        const canvasStyle = {
          backgroundColor: '#f2f2f2',
          backgroundPattern: 'grid' as const,
          gridSize,
          gridColor: '#ebe9e7',
        };
        originalMindmap.setCanvasStyle(canvasStyle);

        const xmlDoc = serializer.toXML(originalMindmap);
        const loadedMindmap = serializer.loadFromDom(xmlDoc, `test-map-${gridSize}`);

        expect(loadedMindmap.getCanvasStyle()?.gridSize).toBe(gridSize);
      });
    });

    test('should handle canvas style with different colors', () => {
      const serializer = new XMLSerializerTango();
      const colors = [
        { bg: '#ffffff', grid: '#000000' },
        { bg: '#f2f2f2', grid: '#ebe9e7' },
        { bg: '#333333', grid: '#666666' },
        { bg: '#ff0000', grid: '#00ff00' },
      ];

      colors.forEach((colorSet, index) => {
        const originalMindmap = new Mindmap(`test-map-${index}`);
        const canvasStyle = {
          backgroundColor: colorSet.bg,
          backgroundPattern: 'grid' as const,
          gridSize: 50,
          gridColor: colorSet.grid,
        };
        originalMindmap.setCanvasStyle(canvasStyle);

        const xmlDoc = serializer.toXML(originalMindmap);
        const loadedMindmap = serializer.loadFromDom(xmlDoc, `test-map-${index}`);

        expect(loadedMindmap.getCanvasStyle()?.backgroundColor).toBe(colorSet.bg);
        expect(loadedMindmap.getCanvasStyle()?.gridColor).toBe(colorSet.grid);
      });
    });
  });
});
