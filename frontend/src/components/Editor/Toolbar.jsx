// frontend/src/components/Editor/Toolbar.jsx (수정된 전체 코드)

import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List,
  AlignLeft, AlignCenter, AlignRight, Link2, Eraser,
  Minus, Code, Undo, Redo, Image as ImageIcon, Palette, Highlighter
} from 'lucide-react';
import { Table as TableIcon } from 'lucide-react';
import CustomDropdown from './CustomDropdown'; // ✨ 커스텀 드롭다운 import
import ColorPickerDropdown from './ColorPickerDropdown';

// (ToolbarButton 컴포넌트는 기존과 동일)
const ToolbarButton = ({ editor, onClickCommand, isActive, title, icon: Icon, disabled = false, className = '' }) => ( <button onClick={() => onClickCommand()} className={`${className} ${isActive ? 'is-active' : ''}`} title={title} disabled={disabled}> <Icon size={18} /> </button> );

// ✨ 드롭다운 옵션 형식 변경
const STYLE_OPTIONS = [
  { value: 'p', label: '본문' }, { value: 'h1', label: '제목 1' },
  { value: 'h2', label: '제목 2' }, { value: 'h3', label: '제목 3' },
  { value: 'quote', label: '인용구' },
];
const FONT_FAMILY_OPTIONS = [
  { value: 'Inter', label: '기본서체' }, { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Malgun Gothic', label: '맑은고딕' }, { value: 'Dotum', label: '돋움' },
];
const FONT_SIZE_OPTIONS = [
  { value: '12px', label: '12' }, { value: '14px', label: '14' }, { value: '16px', label: '16' },
  { value: '18px', label: '18' }, { value: '20px', label: '20' }, { value: '24px', label: '24' },
  { value: '30px', label: '30' }, { value: '36px', label: '36' },
];

const TEXT_COLORS = [ '#000000', '#495057', '#c2255c', '#c92a2a', '#a61e4d', '#862e9c', '#5f3dc4', '#364fc7', '#1864ab', '#0b7285', '#087f5b', '#2b8a3e', '#5c940d', '#e67700', '#d9480f', null ];
const HIGHLIGHT_COLORS = [ '#fff0f6', '#f8f0fc', '#f3f0ff', '#f1f3f5', '#e5f9ff', '#e3fafc', '#e6fcf5', '#f4fce3', '#fff9db', '#fff4e6', '#ffe8cc', '#ffc9c9', '#ffd8a8', '#ffec99', '#d8f5a2', null ];

// (FORMAT_BUTTONS 등 다른 버튼 배열은 기존과 동일)
const FORMAT_BUTTONS = [ { icon: Bold, title: '굵게', command: (editor) => () => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive('bold') }, { icon: Italic, title: '기울임', command: (editor) => () => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive('italic') }, { icon: UnderlineIcon, title: '밑줄', command: (editor) => () => editor.chain().focus().toggleUnderline().run(), isActive: (editor) => editor.isActive('underline') }, { icon: Strikethrough, title: '취소선', command: (editor) => () => editor.chain().focus().toggleStrike().run(), isActive: (editor) => editor.isActive('strike') }, ]; const ALIGN_LIST_BUTTONS = [ { icon: AlignLeft, title: '왼쪽 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('left').run(), isActive: (editor) => editor.isActive({ textAlign: 'left' }) }, { icon: AlignCenter, title: '가운데 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('center').run(), isActive: (editor) => editor.isActive({ textAlign: 'center' }) }, { icon: AlignRight, title: '오른쪽 정렬', command: (editor) => () => editor.chain().focus().setTextAlign('right').run(), isActive: (editor) => editor.isActive({ textAlign: 'right' }) }, { icon: List, title: '글머리 기호', command: (editor) => () => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive('bulletList') }, ]; const INSERT_BUTTONS = [ { icon: Minus, title: '구분선', command: (editor) => () => editor.chain().focus().setHorizontalRule().run() }, { icon: Code, title: '코드 블록', command: (editor) => () => editor.chain().focus().toggleCodeBlock().run(), isActive: (editor) => editor.isActive('codeBlock') }, { icon: TableIcon, title: '표 삽입', command: (editor) => () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() }, ];

const Toolbar = ({ editor, handleImageFiles }) => {
  const imageInputRef = useRef(null);
  // (setLink, handleLocalImageSelect, runCommandAndReFocus 함수는 기존과 동일)
  const setLink = useCallback(() => { if (!editor) return; const previousUrl = editor.getAttributes('link').href; const urlInput = window.prompt('URL', previousUrl); if (urlInput === null) return; let formattedUrl = urlInput.trim(); if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) { formattedUrl = `https://${formattedUrl}`; } if (formattedUrl === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); } else { editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run(); } }, [editor]); const handleLocalImageSelect = useCallback((event) => { if (!editor || !event.target.files) return; handleImageFiles(event.target.files, editor.view, null); }, [editor, handleImageFiles]); const runCommandAndReFocus = useCallback((command) => { command(); editor.view.focus(); }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      {/* 실행 취소/다시 실행 */}
      <ToolbarButton editor={editor} onClickCommand={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="실행 취소" icon={Undo} />
      <ToolbarButton editor={editor} onClickCommand={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시 실행" icon={Redo} />
      <div className="toolbar-separator"></div>

      {/* ✨ 텍스트 스타일 드롭다운 (CustomDropdown으로 교체) */}
      <CustomDropdown
        value={ editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('blockquote') ? 'quote' : 'p' }
        options={STYLE_OPTIONS}
        onChange={value => { const command = () => { if (value === 'p') editor.chain().setParagraph().run(); else if (value === 'quote') editor.chain().toggleBlockquote().run(); else editor.chain().toggleHeading({ level: parseInt(value.replace('h', ''), 10) }).run(); }; runCommandAndReFocus(command); }}
        renderButtonContent={selectedOption => <span>{selectedOption ? selectedOption.label : '스타일'}</span>}
      />
      <CustomDropdown
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        options={FONT_FAMILY_OPTIONS}
        onChange={value => runCommandAndReFocus(() => editor.chain().setFontFamily(value).run())}
        renderButtonContent={selectedOption => <span>{selectedOption ? selectedOption.label : '서체'}</span>}
      />
      <CustomDropdown
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        options={FONT_SIZE_OPTIONS}
        onChange={value => runCommandAndReFocus(() => editor.chain().setFontSize(value).run())}
        renderButtonContent={selectedOption => <span style={{minWidth: '24px', textAlign: 'center'}}>{selectedOption ? selectedOption.label : '16'}</span>}
      />
      <div className="toolbar-separator"></div>
      
      {/* (이하 다른 버튼들은 기존과 동일) */}
      {FORMAT_BUTTONS.map((btn, index) => ( <ToolbarButton key={index} editor={editor} onClickCommand={btn.command(editor)} isActive={btn.isActive(editor)} title={btn.title} icon={btn.icon} /> ))}
      <ToolbarButton editor={editor} onClickCommand={setLink} isActive={editor.isActive('link')} title="링크" icon={Link2} />
      <div className="toolbar-separator"></div>

      {ALIGN_LIST_BUTTONS.map((btn, index) => ( <ToolbarButton key={index} editor={editor} onClickCommand={btn.command(editor)} isActive={btn.isActive(editor)} title={btn.title} icon={btn.icon} /> ))}
      <div className="toolbar-separator"></div>

      <ColorPickerDropdown icon={Palette} title="텍스트 색상" editor={editor} colors={TEXT_COLORS} command={(color) => editor.chain().focus().setColor(color).run()} />
      <ColorPickerDropdown icon={Highlighter} title="하이라이트" editor={editor} colors={HIGHLIGHT_COLORS} command={(color) => editor.chain().focus().toggleHighlight({ color }).run()} />
      <div className="toolbar-separator"></div>
      
      {INSERT_BUTTONS.map((btn, index) => ( <ToolbarButton key={index} editor={editor} onClickCommand={btn.command(editor)} isActive={btn.isActive ? btn.isActive(editor) : undefined} title={btn.title} icon={btn.icon} /> ))}
      <ToolbarButton editor={editor} onClickCommand={() => imageInputRef.current?.click()} title="이미지 삽입" icon={ImageIcon} />
      
      <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleLocalImageSelect} multiple />
    </div>
  );
};

export default Toolbar;