import { describe, it, expect } from '@jest/globals';
import Mindmap from '../../src/components/model/Mindmap';
import NodeModel from '../../src/components/model/NodeModel';
import TxtExporter from '../../src/components/export/TxtExporter';
import MDExporter from '../../src/components/export/MDExporter';
import FreemindExporter from '../../src/components/export/FreemindExporter';

describe('ContentType Attribute Tests', () => {
  it('should handle rich text content with contentType="html" in TxtExporter', async () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    // Set rich text content with HTML
    const richText = '<b>Bold text</b> and <i>italic text</i>';
    centralTopic.setText(richText);
    centralTopic.setContentType('html');

    const exporter = new TxtExporter(mindmap);
    const result = await exporter.export();

    // Should export plain text (HTML stripped)
    expect(result).toContain('Bold text and italic text');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<i>');
  });

  it('should handle plain text content without contentType in TxtExporter', async () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    // Set plain text content
    const plainText = 'Plain text content';
    centralTopic.setText(plainText);
    // Don't set contentType (should default to plain text)

    const exporter = new TxtExporter(mindmap);
    const result = await exporter.export();

    // Should export the plain text as-is
    expect(result).toContain(plainText);
  });

  it('should handle rich text content with contentType="html" in MDExporter', async () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    // Set rich text content with HTML
    const richText = '<b>Bold text</b> and <i>italic text</i>';
    centralTopic.setText(richText);
    centralTopic.setContentType('html');

    const exporter = new MDExporter(mindmap);
    const result = await exporter.export();

    // Should export plain text (HTML stripped) in markdown
    expect(result).toContain('# Bold text and italic text');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<i>');
  });

  it('should handle rich text content with contentType="html" in FreemindExporter', async () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    // Set rich text content with HTML
    const richText = '<b>Bold text</b> and <i>italic text</i>';
    centralTopic.setText(richText);
    centralTopic.setContentType('html');

    const exporter = new FreemindExporter(mindmap);
    const result = await exporter.export();

    // Should preserve HTML in richcontent for FreeMind format
    expect(result).toContain('<richcontent TYPE="NODE">');
    expect(result).toContain('<b>Bold text</b>');
    expect(result).toContain('<i>italic text</i>');
  });

  it('should correctly identify rich text with isRichText() method', () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    // Test with contentType="html"
    centralTopic.setContentType('html');
    expect(centralTopic.isRichText()).toBe(true);

    // Test without contentType
    centralTopic.setContentType(undefined);
    expect(centralTopic.isRichText()).toBe(false);

    // Test with other contentType
    centralTopic.setContentType('text');
    expect(centralTopic.isRichText()).toBe(false);
  });

  it('should correctly strip HTML with getPlainText() method', () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    const richText = '<b>Bold text</b> and <i>italic text</i>';
    centralTopic.setText(richText);
    centralTopic.setContentType('html');

    const plainText = centralTopic.getPlainText();
    expect(plainText).toBe('Bold text and italic text');
    expect(plainText).not.toContain('<b>');
    expect(plainText).not.toContain('<i>');
  });

  it('should return original text with getPlainText() for non-rich content', () => {
    const mindmap = new Mindmap('Test Map');
    const centralTopic = mindmap.getCentralTopic();

    const plainText = 'Plain text content';
    centralTopic.setText(plainText);
    // Don't set contentType (should default to plain text)

    const result = centralTopic.getPlainText();
    expect(result).toBe(plainText);
  });
});
