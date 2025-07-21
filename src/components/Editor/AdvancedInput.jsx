import React, { useRef, useCallback } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, Quote, Paintbrush,
  AlignLeft, AlignCenter, AlignRight, Link2, Eraser, Highlighter, Youtube as YoutubeIcon,
  Heading1, Heading2, Heading3, Pilcrow, Minus, Code, Undo, Redo, Image as ImageIcon
} from 'lucide-react';
import { ResizableImage } from './ResizableImage'; 

// 커스텀 이미지 확장: 리사이즈 기능 추가
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

const FONT_FAMILY_OPTIONS = [
  { label: '기본서체', value: '' },
  { label: '나눔고딕', value: 'Nanum Gothic' },
  { label: '맑은고딕', value: 'Malgun Gothic' },
  { label: '돋움', value: 'Dotum' },
  { label: '굴림', value: 'Gulim' },
  { label: '바탕', value: 'Batang' },
];

const HIGHLIGHT_COLORS = ['#ffc078', '#82c91e', '#15aabf', '#cc5de8', null];

function AdvancedInput({ userPrompt, setUserPrompt }) {
  const imageInputRef = useRef(null);

  // 이미지 파일 처리 로직을 useCallback으로 통합하여 재사용성 증대
  const handleImageFiles = useCallback((files, view, coordinates) => {
    if (!files || files.length === 0) return;

    Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          if (!view || !imageUrl) return;

          const { schema } = view.state;
          const node = schema.nodes.image.create({ src: imageUrl });
          
          let transaction;
          if (coordinates) { // 드래그 앤 드롭의 경우
            transaction = view.state.tr.insert(coordinates.pos, node);
          } else { // 붙여넣기 또는 파일 선택의 경우
            transaction = view.state.tr.replaceSelectionWith(node);
          }
          view.dispatch(transaction);
        };
        reader.readAsDataURL(file);
      });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit, TextStyle, FontFamily, Color, Underline, CustomImage,
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ nocookie: true }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: userPrompt,
    onUpdate: ({ editor }) => setUserPrompt(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose-mirror-editor' },
      handleDrop: function(view, event, _slice, moved) {
        if (!moved && event.dataTransfer) {
          // 로컬 이미지 파일 드롭 처리
          if (event.dataTransfer.files.length > 0) {
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            handleImageFiles(event.dataTransfer.files, view, coordinates);
            return true;
          }
          // 웹 이미지 드롭 처리
          const htmlData = event.dataTransfer.getData('text/html');
          if (htmlData) {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlData;
            const imgElement = tempElement.querySelector('img');
            if (imgElement?.src) {
              event.preventDefault();
              editor?.commands.setImage({ src: imgElement.src });
              return true;
            }
          }
        }
        return false;
      },
      handlePaste: function(view, event, slice) {
        if (event.clipboardData?.files.length > 0) {
          event.preventDefault();
          handleImageFiles(event.clipboardData.files, view, null);
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URL을 입력하세요');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addYoutubeVideo = () => {
    const url = prompt('유튜브 영상 URL을 입력하세요');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };
  
  const handleLocalImageSelect = (event) => {
    handleImageFiles(event.target.files, editor.view, null);
  };

  return (
    <div className="editor-wrapper advanced-editor">
      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={18} /></button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={18} /></button>
        <div className="toolbar-separator"></div>

        <select className="toolbar-select" onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} value={editor.getAttributes('textStyle').fontFamily || ''}>
          {FONT_FAMILY_OPTIONS.map(font => <option key={font.label} value={font.value}>{font.label}</option>)}
        </select>
        <input type="number" className="toolbar-number-input" onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()} defaultValue="16" />
        <div className="toolbar-separator"></div>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={18} /></button>
        {/* ... (이하 다른 툴바 버튼들은 동일) ... */}
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={18} /></button>
        <div className="toolbar-separator"></div>

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}><Code size={18} /></button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={18} /></button>
        <button onClick={addYoutubeVideo}><YoutubeIcon size={18} /></button>
        <button onClick={() => imageInputRef.current?.click()}><ImageIcon size={18} /></button>
        <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleLocalImageSelect} multiple />
      </div>
      <div className="editor-toolbar color-toolbar">
        <Paintbrush size={18} />
        {['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00'].map(color => (
          <button key={color} onClick={() => editor.chain().focus().setColor(color).run()} className={editor.isActive('textStyle', { color }) ? 'is-active' : ''} style={{ backgroundColor: color }} />
        ))}
        <div className="toolbar-separator"></div>
        <Highlighter size={18} />
        {HIGHLIGHT_COLORS.map((color, index) => (
          <button
            key={index}
            onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
            className={editor.isActive('highlight', { color }) ? 'is-active' : ''}
          >
            {color ? <div className="highlight-swatch" style={{ backgroundColor: color }} /> : <Eraser size={14} />}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default AdvancedInput;