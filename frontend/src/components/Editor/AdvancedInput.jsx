import React, { useRef, useCallback } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Youtube from '@tiptap/extension-youtube';
import FontSize from 'tiptap-extension-font-size';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, Quote, Paintbrush,
  AlignLeft, AlignCenter, AlignRight, Link2, Eraser, Highlighter,
  Minus, Code, Undo, Redo, Image as ImageIcon
} from 'lucide-react';
import { ResizableImage } from './ResizableImage';

const CustomImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), width: { default: null } }; },
  addNodeView() { return ReactNodeViewRenderer(ResizableImage); },
});

const FONT_FAMILY_OPTIONS = [
  { label: '기본서체', value: 'Inter' }, { label: '나눔고딕', value: 'Nanum Gothic' },
  { label: '맑은고딕', value: 'Malgun Gothic' }, { label: '돋움', value: 'Dotum' },
];
const FONT_SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];
const HIGHLIGHT_COLORS = ['#ffc078', '#82c91e', '#15aabf', '#cc5de8', null];

function AdvancedInput({ userPrompt, setUserPrompt }) {
  const imageInputRef = useRef(null);

  const handleImageFiles = useCallback((files, view, coordinates) => {
    if (!files || files.length === 0) return;
    Array.from(files).filter(file => file.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (!view || !imageUrl) return;
        const { schema } = view.state;
        const node = schema.nodes.image.create({ src: imageUrl });
        let transaction;
        if (coordinates) {
          transaction = view.state.tr.insert(coordinates.pos, node);
        } else {
          transaction = view.state.tr.replaceSelectionWith(node);
        }
        view.dispatch(transaction);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        heading: { levels: [1, 2, 3] },
        underline: false,
      }),
      TextStyle, FontFamily, Color, CustomImage, FontSize, Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ nocookie: true }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: userPrompt,
    onUpdate: ({ editor }) => {
        setUserPrompt(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'prose-mirror-editor' },
      handleDrop: function(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files.length > 0) {
          event.preventDefault();
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          handleImageFiles(event.dataTransfer.files, view, coordinates);
          return true;
        }
        return false;
      },
      handlePaste: function(view, event) {
        if (event.clipboardData?.files.length > 0) {
          handleImageFiles(event.clipboardData.files, view, null);
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) { return null; }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };


  const handleLocalImageSelect = (event) => {
    handleImageFiles(event.target.files, editor.view, null);
  };

  return (
    <div className="editor-wrapper advanced-editor">
      <div className="editor-toolbar">
        {/* 실행 취소/다시 실행 */}
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={18} /></button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={18} /></button>
        <div className="toolbar-separator"></div>

        {/* 텍스트 스타일 */}
        <select
          className="toolbar-select"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'p') editor.chain().focus().setParagraph().run();
            else if (value === 'quote') editor.chain().focus().toggleBlockquote().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) }).run();
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
        <select className="toolbar-select" onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} value={editor.getAttributes('textStyle').fontFamily || 'Inter'}>
            {FONT_FAMILY_OPTIONS.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
        </select>
        <select
            className="toolbar-select font-size-select"
            value={editor.getAttributes('textStyle').fontSize || '16px'}
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        >
            {FONT_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size.replace('px', '')}</option>)}
        </select>
        <div className="toolbar-separator"></div>
        
        {/* 텍스트 포맷팅 */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><UnderlineIcon size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough size={18} /></button>
        <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}><Link2 size={18} /></button>
        <div className="toolbar-separator"></div>

        {/* 텍스트 정렬 및 리스트 */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={18} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={18} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={18} /></button>
        <div className="toolbar-separator"></div>
        
        {/* 색상 및 하이라이트 */}
        <Paintbrush size={18} />
        {['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#862e9c'].map(color => (
            <button key={color} onClick={() => editor.chain().focus().setColor(color).run()} className={`color-swatch ${editor.isActive('textStyle', { color }) ? 'is-active' : ''}`} style={{ backgroundColor: color }} />
        ))}
        <div className="toolbar-separator"></div>
        <Highlighter size={18} />
        {HIGHLIGHT_COLORS.map((color, index) => (
            <button key={index} onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} className={`highlight-swatch ${editor.isActive('highlight', { color }) ? 'is-active' : ''}`}>
              {color ? <div className="highlight-color" style={{ backgroundColor: color }} /> : <Eraser size={14} />}
            </button>
        ))}
        <div className="toolbar-separator"></div>
        
        {/* 삽입 */}
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선"><Minus size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} title="코드블록"><Code size={18} /></button>
        <button onClick={() => imageInputRef.current?.click()} title="이미지"><ImageIcon size={18} /></button>
      </div>
      <EditorContent editor={editor} />
      <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleLocalImageSelect} multiple />
    </div>
  );
}

export default AdvancedInput;