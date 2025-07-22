import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, Paintbrush,
  AlignLeft, AlignCenter, AlignRight, Link2, Eraser, Highlighter,
  Minus, Code, Undo, Redo, Image as ImageIcon
} from 'lucide-react';

// 재사용 가능한 툴바 버튼 컴포넌트
const ToolbarButton = ({ editor, onClickCommand, isActive, title, icon: Icon, disabled = false, className = '' }) => (
  <button
    onClick={() => onClickCommand()}
    className={`${className} ${isActive ? 'is-active' : ''}`}
    title={title}
    disabled={disabled}
  >
    <Icon size={18} />
  </button>
);

// 툴바 옵션/버튼 그룹 정의 *** 맑은고딕과 돋움체는 폰트파일이없음
const FONT_FAMILY_OPTIONS = [
  { label: '기본서체', value: 'Inter' },
  { label: '나눔고딕', value: 'Nanum Gothic' },
  { label: '맑은고딕', value: 'Malgun Gothic' },
  { label: '돋움', value: 'Dotum' },
];
const FONT_SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];
const HIGHLIGHT_COLORS = ['#ffc078', '#82c91e', '#15aabf', '#cc5de8', null];
const TEXT_COLORS = ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#862e9c'];

const FORMAT_BUTTONS = [
  { icon: Bold, title: '굵게', command: (editor) => () => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive('bold') },
  { icon: Italic, title: '기울임', command: (editor) => () => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive('italic') },
  { icon: UnderlineIcon, title: '밑줄', command: (editor) => () => editor.chain().focus().toggleUnderline().run(), isActive: (editor) => editor.isActive('underline') },
  { icon: Strikethrough, title: '취소선', command: (editor) => () => editor.chain().focus().toggleStrike().run(), isActive: (editor) => editor.isActive('strike') },
];

const ALIGN_LIST_BUTTONS = [
  { icon: AlignLeft, title: '왼쪽 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('left').run(), isActive: (editor) => editor.isActive({ textAlign: 'left' }) },
  { icon: AlignCenter, title: '가운데 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('center').run(), isActive: (editor) => editor.isActive({ textAlign: 'center' }) },
  { icon: AlignRight, title: '오른쪽 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('right').run(), isActive: (editor) => editor.isActive({ textAlign: 'right' }) },
  { icon: List, title: '글머리 기호', command: (editor) => () => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive('bulletList') },
];

const INSERT_BUTTONS = [
  { icon: Minus, title: '구분선', command: (editor) => () => editor.chain().focus().setHorizontalRule().run() },
  { icon: Code, title: '코드 블록', command: (editor) => () => editor.chain().focus().toggleCodeBlock().run(), isActive: (editor) => editor.isActive('codeBlock') },
];


const Toolbar = ({ editor, handleImageFiles }) => {
  const imageInputRef = useRef(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const urlInput = window.prompt('URL', previousUrl);

    if (urlInput === null) return;

    let formattedUrl = urlInput.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (formattedUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
    }
  }, [editor]);

  const handleLocalImageSelect = useCallback((event) => {
    if (!editor || !event.target.files) return;
    handleImageFiles(event.target.files, editor.view, null);
  }, [editor, handleImageFiles]);

  const runCommandAndReFocus = useCallback((command) => {
    command();
    editor.view.focus();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      {/* 실행 취소/다시 실행 */}
      <ToolbarButton
        editor={editor}
        onClickCommand={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="실행 취소"
        icon={Undo}
      />
      <ToolbarButton
        editor={editor}
        onClickCommand={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="다시 실행"
        icon={Redo}
      />
      <div className="toolbar-separator"></div>

      {/* 텍스트 스타일 드롭다운 */}
      <select
        className="toolbar-select"
        onChange={(e) => runCommandAndReFocus(() => {
          const value = e.target.value;
          if (value === 'p') editor.chain().setParagraph().run();
          else if (value === 'quote') editor.chain().toggleBlockquote().run();
          else editor.chain().toggleHeading({ level: parseInt(value.replace('h', ''), 10) }).run();
        })}
        value={
          editor.isActive('heading', { level: 1 }) ? 'h1' :
          editor.isActive('heading', { level: 2 }) ? 'h2' :
          editor.isActive('heading', { level: 3 }) ? 'h3' :
          editor.isActive('blockquote') ? 'quote' : 'p'
        }
      >
        <option value="p">본문</option>
        <option value="h1">제목 1</option>
        <option value="h2">제목 2</option>
        <option value="h3">제목 3</option>
        <option value="quote">인용구</option>
      </select>
      
      <select
        className="toolbar-select"
        onChange={(e) => runCommandAndReFocus(() => editor.chain().setFontFamily(e.target.value).run())}
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
      >
        {FONT_FAMILY_OPTIONS.map(font => (
          <option key={font.value} value={font.value}>{font.label}</option>
        ))}
      </select>

      <select
        className="toolbar-select font-size-select"
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        onChange={(e) => runCommandAndReFocus(() => editor.chain().setFontSize(e.target.value).run())}
      >
        {FONT_SIZE_OPTIONS.map(size => (
          <option key={size} value={size}>{size.replace('px', '')}</option>
        ))}
      </select>
      <div className="toolbar-separator"></div>
      
      {/* 텍스트 포맷팅 */}
      {FORMAT_BUTTONS.map((btn, index) => (
        <ToolbarButton
          key={index}
          editor={editor}
          onClickCommand={btn.command(editor)}
          isActive={btn.isActive(editor)}
          title={btn.title}
          icon={btn.icon}
        />
      ))}
      <ToolbarButton
        editor={editor}
        onClickCommand={setLink}
        isActive={editor.isActive('link')}
        title="링크"
        icon={Link2}
      />
      <div className="toolbar-separator"></div>

      {/* 텍스트 정렬 및 리스트 */}
      {ALIGN_LIST_BUTTONS.map((btn, index) => (
        <ToolbarButton
          key={index}
          editor={editor}
          onClickCommand={btn.command(editor)}
          isActive={btn.isActive(editor)}
          title={btn.title}
          icon={btn.icon}
        />
      ))}
      <div className="toolbar-separator"></div>
      
      {/* 색상 및 하이라이트 */}
      <Paintbrush size={18} title="텍스트 색상" />
      {TEXT_COLORS.map(color => (
        <button
          key={color}
          onClick={() => editor.chain().focus().setColor(color).run()}
          className={`color-swatch ${editor.isActive('textStyle', { color }) ? 'is-active' : ''}`}
          style={{ backgroundColor: color }}
          title={`색상: ${color}`}
        />
      ))}
      <div className="toolbar-separator"></div>
      
      <Highlighter size={18} title="하이라이트" />
      {HIGHLIGHT_COLORS.map((color, index) => (
        <button
          key={index}
          onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
          className={`highlight-swatch ${editor.isActive('highlight', { color }) ? 'is-active' : ''}`}
          title={color ? `하이라이트: ${color}` : '하이라이트 제거'}
        >
          {color ? <div className="highlight-color" style={{ backgroundColor: color }} /> : <Eraser size={14} />}
        </button>
      ))}
      <div className="toolbar-separator"></div>
      
      {/* 삽입 */}
      {INSERT_BUTTONS.map((btn, index) => (
        <ToolbarButton
          key={index}
          editor={editor}
          onClickCommand={btn.command(editor)}
          isActive={btn.isActive ? btn.isActive(editor) : undefined}
          title={btn.title}
          icon={btn.icon}
        />
      ))}
      <ToolbarButton
        editor={editor}
        onClickCommand={() => imageInputRef.current?.click()}
        title="이미지 삽입"
        icon={ImageIcon}
      />
      
      {/* 이미지 업로드를 위한 숨겨진 input 요소 */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={handleLocalImageSelect}
        multiple
      />
    </div>
  );
};

export default Toolbar;