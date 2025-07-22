import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, Quote, Paintbrush,
  AlignLeft, AlignCenter, AlignRight, Link2, Eraser, Highlighter,
  Minus, Code, Undo, Redo, Image as ImageIcon
} from 'lucide-react';

// 툴바에서만 사용하는 상수들을 Toolbar 컴포넌트 내부나 상단에 정의합니다.
const FONT_FAMILY_OPTIONS = [
  { label: '기본서체', value: 'Inter' },
  { label: '나눔고딕', value: 'Nanum Gothic' },
  { label: '맑은고딕', value: 'Malgun Gothic' },
  { label: '돋움', value: 'Dotum' },
];

const FONT_SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

const HIGHLIGHT_COLORS = ['#ffc078', '#82c91e', '#15aabf', '#cc5de8', null];

const Toolbar = ({ editor, handleImageFiles }) => {
  const imageInputRef = useRef(null);

  // setLink와 handleLocalImageSelect 로직은 Toolbar가 직접 제어하므로 여기에 위치합니다.
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleLocalImageSelect = useCallback((event) => {
    if (!editor || !event.target.files) return;
    // 부모 컴포넌트(TiptapEditor)로부터 받은 이미지 처리 함수를 호출합니다.
    handleImageFiles(event.target.files, editor.view, null);
  }, [editor, handleImageFiles]);

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      {/* 실행 취소/다시 실행 */}
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="실행 취소">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시 실행">
        <Redo size={18} />
      </button>
      <div className="toolbar-separator"></div>

      {/* 텍스트 스타일 */}
      <select
        className="toolbar-select"
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'p') editor.chain().focus().setParagraph().run();
          else if (value === 'quote') editor.chain().focus().toggleBlockquote().run();
          else editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', ''), 10) }).run();
        }}
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
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} 
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
      >
        {FONT_FAMILY_OPTIONS.map(font => (
          <option key={font.value} value={font.value}>{font.label}</option>
        ))}
      </select>

      <select
        className="toolbar-select font-size-select"
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
      >
        {FONT_SIZE_OPTIONS.map(size => (
          <option key={size} value={size}>{size.replace('px', '')}</option>
        ))}
      </select>
      <div className="toolbar-separator"></div>
      
      {/* 텍스트 포맷팅 */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="굵게">
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="기울임">
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''} title="밑줄">
        <UnderlineIcon size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} title="취소선">
        <Strikethrough size={18} />
      </button>
      <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="링크">
        <Link2 size={18} />
      </button>
      <div className="toolbar-separator"></div>

      {/* 텍스트 정렬 및 리스트 */}
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''} title="왼쪽 정렬">
        <AlignLeft size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''} title="가운데 정렬">
        <AlignCenter size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''} title="오른쪽 정렬">
        <AlignRight size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="글머리 기호">
        <List size={18} />
      </button>
      <div className="toolbar-separator"></div>
      
      {/* 색상 및 하이라이트 */}
      <Paintbrush size={18} />
      {['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#862e9c'].map(color => (
        <button 
          key={color} 
          onClick={() => editor.chain().focus().setColor(color).run()} 
          className={`color-swatch ${editor.isActive('textStyle', { color }) ? 'is-active' : ''}`} 
          style={{ backgroundColor: color }} 
          title={`색상: ${color}`}
        />
      ))}
      <div className="toolbar-separator"></div>
      
      <Highlighter size={18} />
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
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
        <Minus size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} title="코드 블록">
        <Code size={18} />
      </button>
      <button onClick={() => imageInputRef.current?.click()} title="이미지 삽입">
        <ImageIcon size={18} />
      </button>
      
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