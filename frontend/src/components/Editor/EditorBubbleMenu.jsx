// EditorBubbleMenu.jsx 수정

import React, { useState, useCallback, useRef } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link2, Trash2 } from 'lucide-react';

const EditorBubbleMenu = ({ editor }) => {
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const linkInputRef = useRef(null);

  const toggleLinkEditor = useCallback(() => {
    setIsLinkEditorOpen(prevState => !prevState);
  }, []);

  const setLink = useCallback(() => {
    if (!editor) return;
    let url = linkInputRef.current?.value; // 입력 필드의 값 가져오기

    if (url === null) {
      return;
    }

    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`; // http/https 없으면 https:// 강제 추가
    }
    // ✨ ✨ ✨ 추가 끝 ✨ ✨ ✨

    if (url === '') { // 빈 문자열인 경우 링크 해제
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else { // URL이 있는 경우 링크 설정
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsLinkEditorOpen(false);
  }, [editor]);

  const handleLinkInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
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
            ref={linkInputRef}
          />
          <button
            onClick={setLink}
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
                else editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', ''), 10) }).run();
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