// EditorBubbleMenu.jsx

import React, { useState, useCallback, useRef } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link2, Trash2 } from 'lucide-react';

// === 재사용 가능한 버블 메뉴 버튼 컴포넌트 ===
// ToolbarButton과 유사하게, 버블 메뉴 내의 각 버튼에 대한 공통 로직을 캡슐화합니다.
const BubbleMenuButton = ({ editor, commandName, onClickCommand, isActive, icon: Icon }) => (
  <button
    onClick={() => onClickCommand ? onClickCommand() : editor.chain().focus()[commandName]().run()}
    className={isActive ? 'is-active' : ''}
  >
    <Icon size={16} /> {/* 버블 메뉴 아이콘은 16px로 줄였습니다 */}
  </button>
);


const EditorBubbleMenu = ({ editor }) => {
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const linkInputRef = useRef(null);

  const toggleLinkEditor = useCallback(() => {
    setIsLinkEditorOpen(prevState => !prevState);
  }, []);

  const setLink = useCallback(() => {
    if (!editor) return;
    let url = linkInputRef.current?.value;

    if (url === null) {
      return;
    }

    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsLinkEditorOpen(false);
  }, [editor]);

  const handleLinkInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    }
  }, [setLink]);

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
          {/* 블록 타입 드롭다운 그룹 */}
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

          {/* 텍스트 포맷팅 버튼 그룹 (Bold, Italic, Underline, Strikethrough, Code) */}
          <div className="button-group">
            <BubbleMenuButton editor={editor} commandName="toggleBold" isActive={editor.isActive('bold')} icon={Bold} />
            <BubbleMenuButton editor={editor} commandName="toggleItalic" isActive={editor.isActive('italic')} icon={Italic} />
            <BubbleMenuButton editor={editor} commandName="toggleUnderline" isActive={editor.isActive('underline')} icon={UnderlineIcon} />
            <BubbleMenuButton editor={editor} commandName="toggleStrike" isActive={editor.isActive('strike')} icon={Strikethrough} />
            <BubbleMenuButton editor={editor} commandName="toggleCode" isActive={editor.isActive('code')} icon={Code} />
          </div>

          {/* 링크 관련 버튼 그룹 (링크 설정, 링크 해제) */}
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