import React, { useEffect, useState, MouseEvent, ChangeEvent } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import { manageStore } from "~/store";
import { buildReferences } from "~/components/Questions/buildReferences";
import tippy, { Instance } from "tippy.js";
import "./TiptapEditor.css";

// Type definitions
interface TiptapEditorProps {
  value?: string;
  onBlurListener: (content: string, lang: string) => void;
  extended?: boolean;
  isRtl?: boolean;
  lang?: string;
  code?: string;
}

interface MenuBarProps {
  editor: Editor;
  extended?: boolean;
}

interface ReferenceItem {
  id: string;
  value: string;
  label?: string;
}

interface MentionListProps {
  items: ReferenceItem[];
  command: (item: { id: string; label: string }) => void;
  editor: Editor;
}


function TiptapEditor({ 
  value, 
  onBlurListener, 
  extended = false, 
  isRtl = false, 
  lang = 'en', 
  code = '' 
}: TiptapEditorProps): JSX.Element | null {
  console.debug("TiptapEditor for: " + code);

  const [processedValue, setProcessedValue] = useState<string>('');

  const oneLine = (value: string, oneLine: boolean): string => {
    return !oneLine
      ? value
      : "<p>" +
          value
            .replace(/<br>/gi, "")
            .replace(/<p>/gi, "")
            .replace(/<\/p>/g, "") +
          "</p>";
  };

  // Process value on mount and when value changes
  useEffect(() => {
    setProcessedValue(value || '');
  }, [value]);

  async function references(searchTerm: string): Promise<ReferenceItem[]> {
    const designState = manageStore.getState().designState || { state: {} };
    const values = buildReferences(
      (designState as any).componentIndex || {},
      code,
      designState,
      (designState as any).langInfo?.mainLang || 'en'
    );
    
    if (searchTerm.length === 0) {
      return values;
    } else {
      const matches: ReferenceItem[] = [];
      for (let i = 0; i < values.length; i++) {
        if (
          values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0
        ) {
          matches.push(values[i]);
        }
      }
      return matches;
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: extended ? {} : false,
        orderedList: extended ? {} : false,
        listItem: extended ? {} : false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: async ({ query }: { query: string }) => {
            return await references(query);
          },
          render: () => {
            let component: MentionList;
            let popup: Instance[];

            return {
              onStart: (props: any) => {
                component = new MentionList({
                  items: props.items,
                  command: props.command,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props: any) {
                component.updateProps({ items: props.items, command: props.command, editor: props.editor });

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },

              onKeyDown(props: any) {
                if (props.event?.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }

                return component.onKeyDown({ event: props.event });
              },

              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Underline,
      Strike,
    ],
    content: oneLine(processedValue, !extended),
    onUpdate: () => {
      onFocus();
    },
    onBlur: () => {
      onBlur();
    },
    editorProps: {
      attributes: {
        class: isRtl ? 'rtl tiptap-editor' : 'ltr tiptap-editor',
      },
    },
  });

  useEffect(() => {
    if (editor && processedValue !== editor.getHTML()) {
      editor.commands.setContent(oneLine(processedValue, !extended), false);
    }
  }, [processedValue, editor, extended]);

  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
    }
  }, [editor]);

  let timeoutID: NodeJS.Timeout | null = null;

  const onFocus = (): void => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  };

  const onBlur = (): void => {
    timeoutID = setTimeout(() => {
      if (editor) {
        const content = editor.getHTML();
        onBlurListener(content, lang);
      }
    }, 500);
  };

  const onContainerClick = (e: MouseEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A" && target.className.includes("tiptap-link")) {
      e.preventDefault();
      const href = (target as HTMLAnchorElement).href;
      if (href) {
        window.open(href, "_blank");
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      onClick={onContainerClick}
      className="tiptap-wrapper"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <MenuBar editor={editor} extended={extended} />
      <EditorContent editor={editor} />
    </div>
  );
}

// Menu bar component
function MenuBar({ editor, extended = false }: MenuBarProps): JSX.Element | null {
  if (!editor) {
    return null;
  }

  const addLink = (): void => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = (): void => {
    editor.chain().focus().unsetLink().run();
  };

  const setFontSize = (size: string): void => {
    // Remove any existing font size styles first
    editor.chain().focus().unsetMark('textStyle').run();
    
    if (size === 'small') {
      editor.chain().focus().setMark('textStyle', { fontSize: '0.75em' }).run();
    } else if (size === 'large') {
      editor.chain().focus().setMark('textStyle', { fontSize: '1.5em' }).run();
    } else if (size === 'huge') {
      editor.chain().focus().setMark('textStyle', { fontSize: '2em' }).run();
    } else {
      editor.chain().focus().setMark('textStyle', { fontSize: '1em' }).run();
    }
  };

  return (
    <div className="tiptap-menubar">
      {/* Font Size */}
      <select 
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFontSize(e.target.value)}
        className="tiptap-select"
      >
        <option value="normal">Normal</option>
        <option value="small">Small</option>
        <option value="large">Large</option>
        <option value="huge">Huge</option>
      </select>

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        type="button"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        type="button"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        type="button"
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        type="button"
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      {/* Links */}
      <button
        onClick={addLink}
        className={editor.isActive('link') ? 'is-active' : ''}
        type="button"
        title="Add Link"
      >
        🔗
      </button>
      {editor.isActive('link') && (
        <button
          onClick={removeLink}
          type="button"
          title="Remove Link"
        >
          🔗❌
        </button>
      )}

      {/* Lists (only in extended mode) */}
      {extended && (
        <>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type="button"
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            type="button"
            title="Numbered List"
          >
            1. List
          </button>
          {/* Outdent/Indent not available in this TipTap version
          <button
            onClick={() => editor.chain().focus().outdent().run()}
            type="button"
            title="Outdent"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().indent().run()}
            type="button"
            title="Indent"
          >
            →
          </button>
          */}
        </>
      )}

      {/* Colors */}
      <input
        type="color"
        onInput={(e: ChangeEvent<HTMLInputElement>) => 
          editor.chain().focus().setColor(e.target.value).run()
        }
        value={editor.getAttributes('textStyle').color || '#000000'}
        title="Text Color"
        className="tiptap-color-picker"
      />
      
      <input
        type="color"
        onInput={(e: ChangeEvent<HTMLInputElement>) => 
          editor.chain().focus().setHighlight({ color: e.target.value }).run()
        }
        title="Background Color"
        className="tiptap-color-picker"
      />

      {/* Clear Formatting */}
      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        type="button"
        title="Clear Formatting"
      >
        Clear
      </button>
    </div>
  );
}

// TypeScript-converted mention list component
class MentionList {
  public items: ReferenceItem[];
  public command: (item: { id: string; label: string }) => void;
  public editor: Editor;
  public selectedIndex: number;
  public element: HTMLDivElement;

  constructor({ items, command, editor }: MentionListProps) {
    this.items = items;
    this.command = command;
    this.editor = editor;
    this.selectedIndex = 0;

    this.element = document.createElement('div');
    this.element.className = 'mention-list';

    this.updateItems();
  }

  updateItems(): void {
    this.element.innerHTML = '';
    
    this.items.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = `mention-item ${index === this.selectedIndex ? 'is-selected' : ''}`;
      button.textContent = item.value;
      button.addEventListener('click', () => this.selectItem(index));
      this.element.appendChild(button);
    });
  }

  onKeyDown({ event }: { event: KeyboardEvent }): boolean {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler(): void {
    this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length;
    this.updateItems();
  }

  downHandler(): void {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    this.updateItems();
  }

  enterHandler(): void {
    this.selectItem(this.selectedIndex);
  }

  selectItem(index: number): void {
    const item = this.items[index];
    if (item) {
      this.command({ 
        id: `{{ ${item.id}.value }}`,
        label: item.value,
      });
    }
  }

  updateProps(props: MentionListProps): void {
    this.items = props.items;
    this.command = props.command;
    this.updateItems();
  }

  destroy(): void {
    this.element.remove();
  }
}

export default React.memo(TiptapEditor);