// frontend/src/components/Editor/EditorBubbleMenu.jsx (전체 코드)

import React, { useState, useCallback, useRef } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link2, Trash2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown'; // ✨ CustomDropdown import

const BubbleMenuButton = ({ editor, commandName, onClickCommand, isActive, icon: Icon }) => (
  <button
    onClick={() => onClickCommand ? onClickCommand() : editor.chain().focus()[commandName]().run()}
    className={isActive ? 'is-active' : ''}
  >
    <Icon size={16} />
  </button>
);

// ✨ 드롭다운에 사용할 옵션 배열
const BUBBLE_STYLE_OPTIONS = [
  { value: 'p', label: '본문' },
  { value: 'h1', label: '제목 1' },
  { value: 'h2', label: '제목 2' },
  { value: 'h3', label: '제목 3' },
];

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

  // ✨ 현재 활성화된 스타일 값을 찾는 로직
  const currentStyle = BUBBLE_STYLE_OPTIONS.find(opt => {
      if (opt.value === 'p') return editor.isActive('paragraph');
      return editor.isActive('heading', { level: parseInt(opt.value.replace('h', '')) });
    })?.value || 'p';

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
          {/* ✨ 기존 select를 CustomDropdown으로 교체 */}
          <div className="button-group">
             <CustomDropdown
                value={currentStyle}
                options={BUBBLE_STYLE_OPTIONS}
                onChange={value => {
                  if (value === 'p') editor.chain().focus().setParagraph().run();
                  else editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) }).run();
                }}
                renderButtonContent={selectedOption => <span>{selectedOption ? selectedOption.label : '스타일'}</span>}
                buttonClassName="bubble-dropdown-button" // ✨ 버블 메뉴용 스타일 클래스 추가
              />
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