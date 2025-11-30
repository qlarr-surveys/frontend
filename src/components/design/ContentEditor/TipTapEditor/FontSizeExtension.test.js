/**
 * Unit tests for FontSize Extension
 * 
 * To run these tests, you'll need to set up a test runner (Vitest or Jest)
 * 
 * Installation (if using Vitest):
 * npm install -D vitest @vitest/ui
 * 
 * Add to package.json scripts:
 * "test": "vitest",
 * "test:ui": "vitest --ui"
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontSize from './FontSizeExtension';

describe('FontSize Extension', () => {
  let editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({
          heading: false,
        }),
        TextStyle,
        FontSize,
      ],
      content: '<p>Test content</p>',
    });
  });

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  describe('setFontSize command', () => {
    it('should set font size on selected text', () => {
      editor.commands.selectAll();
      editor.commands.setFontSize('1.5em');
      
      const html = editor.getHTML();
      expect(html).toContain('font-size: 1.5em');
    });

    it('should apply different font sizes to different selections', () => {
      editor.commands.setContent('<p>First Second Third</p>');
      
      // Select "First"
      editor.commands.setTextSelection({ from: 1, to: 6 });
      editor.commands.setFontSize('2em');
      
      // Select "Second"
      editor.commands.setTextSelection({ from: 7, to: 13 });
      editor.commands.setFontSize('0.75em');
      
      const html = editor.getHTML();
      expect(html).toContain('font-size: 2em');
      expect(html).toContain('font-size: 0.75em');
    });

    it('should handle various font size units', () => {
      const sizes = ['0.75em', '1em', '1.5em', '2.5em', '16px', '1.2rem'];
      
      sizes.forEach((size) => {
        editor.commands.setContent('<p>Test</p>');
        editor.commands.selectAll();
        editor.commands.setFontSize(size);
        
        const html = editor.getHTML();
        expect(html).toContain(`font-size: ${size}`);
      });
    });
  });

  describe('unsetFontSize command', () => {
    it('should remove font size when other textStyle attributes exist', () => {
      editor.commands.selectAll();
      editor.commands.setColor('#ff0000');
      editor.commands.setFontSize('1.5em');
      
      // Verify both are set
      let attrs = editor.getAttributes('textStyle');
      expect(attrs.color).toBe('#ff0000');
      expect(attrs.fontSize).toBe('1.5em');
      
      editor.commands.unsetFontSize();
      
      // Color should remain, fontSize should be removed
      attrs = editor.getAttributes('textStyle');
      expect(attrs.color).toBe('#ff0000');
      expect(attrs.fontSize).toBeUndefined();
    });

    it('should remove textStyle mark when only fontSize exists', () => {
      editor.commands.selectAll();
      editor.commands.setFontSize('1.5em');
      
      // Verify fontSize is set
      let attrs = editor.getAttributes('textStyle');
      expect(attrs.fontSize).toBe('1.5em');
      
      editor.commands.unsetFontSize();
      
      // textStyle should be completely removed
      attrs = editor.getAttributes('textStyle');
      expect(attrs).toEqual({});
    });
  });

  describe('parseHTML', () => {
    it('should parse font-size from HTML style attribute', () => {
      editor.commands.setContent('<p><span style="font-size: 1.5em">Test</span></p>');
      
      editor.commands.selectText({ from: 1, to: 5 });
      const attrs = editor.getAttributes('textStyle');
      expect(attrs.fontSize).toBe('1.5em');
    });

    it('should remove quotes from font-size value', () => {
      editor.commands.setContent('<p><span style="font-size: \'1.5em\'">Test</span></p>');
      
      editor.commands.selectText({ from: 1, to: 5 });
      const attrs = editor.getAttributes('textStyle');
      expect(attrs.fontSize).toBe('1.5em');
    });

    it('should handle font-size with double quotes', () => {
      editor.commands.setContent('<p><span style="font-size: "1.5em"">Test</span></p>');
      
      editor.commands.selectText({ from: 1, to: 5 });
      const attrs = editor.getAttributes('textStyle');
      expect(attrs.fontSize).toBe('1.5em');
    });
  });

  describe('renderHTML', () => {
    it('should render font-size in HTML output', () => {
      editor.commands.selectAll();
      editor.commands.setFontSize('2em');
      
      const html = editor.getHTML();
      expect(html).toMatch(/style="[^"]*font-size:\s*2em[^"]*"/);
    });

    it('should not render font-size when not set', () => {
      editor.commands.selectAll();
      editor.commands.setContent('<p>Test</p>');
      
      const html = editor.getHTML();
      expect(html).not.toContain('font-size');
    });

    it('should render font-size with other styles', () => {
      editor.commands.selectAll();
      editor.commands.setColor('#ff0000');
      editor.commands.setFontSize('1.5em');
      
      const html = editor.getHTML();
      expect(html).toContain('font-size: 1.5em');
      expect(html).toContain('color: #ff0000');
    });
  });

  describe('Extension options', () => {
    it('should have correct extension name', () => {
      const extension = editor.extensionManager.extensions.find(
        (ext) => ext.name === 'fontSize'
      );
      expect(extension).toBeDefined();
      expect(extension.name).toBe('fontSize');
    });

    it('should apply to textStyle types', () => {
      const extension = editor.extensionManager.extensions.find(
        (ext) => ext.name === 'fontSize'
      );
      expect(extension.options.types).toContain('textStyle');
    });
  });
});

