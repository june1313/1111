// EditorBubbleMenu.jsx

import React, { useState, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link2, Trash2 } from 'lucide-react';

const EditorBubbleMenu = ({ editor }) => {
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  const toggleLinkEditor = useCallback(() => {
    setIsLinkEditorOpen(prevState => !prevState);
  }, []);

  const setLink = useCallback((url) => {
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setIsLinkEditorOpen(false);
  }, [editor]);

  const handleLinkInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink(e.target.value);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, animation: 'fade' }}
      className="bubble-menu-container"
    >
      {isLinkEditorOpen ? (
        <div className="link-editor">
          <input
            autoFocus
            type="url"
            placeholder="https://example.com"
            defaultValue={editor.getAttributes('link').href || ''}
            onKeyDown={handleLinkInputKeyDown}
            className="link-input"
          />
          <button
            onClick={() => setLink(document.querySelector('.link-input').value)}
            className="link-apply-button"
          >
            적용
          </button>
        </div>
      ) : (
        <div className="bubble-menu-buttons">
          {/* 블록 타입 및 텍스트 서식 */}
          <div className="button-group">
            <select
              className="toolbar-select bubble-select"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'p') editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) }).run();
              }}
              value={
                editor.isActive('heading', { level: 1 }) ? 'h1' :
                editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
              }
            >
              <option value="p">본문</option>
              <option value="h1">제목 1</option>
              <option value="h2">제목 2</option>
              <option value="h3">제목 3</option>
            </select>
          </div>

          <div className="button-group">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
              <Bold size={16} />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
              <Italic size={16} />
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>
              <UnderlineIcon size={16} />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
              <Strikethrough size={16} />
            </button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''}>
              <Code size={16} />
            </button>
          </div>

          <div className="button-group">
            <button onClick={toggleLinkEditor} className={editor.isActive('link') ? 'is-active' : ''}>
              <Link2 size={16} />
            </button>
            {editor.isActive('link') && (
              <button onClick={() => { editor.chain().focus().unsetLink().run(); setIsLinkEditorOpen(false); }} className="unlink-button">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;