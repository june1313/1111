import React, { useCallback } from 'react';
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

// 분리된 컴포넌트들을 import 합니다.
import Toolbar from './Toolbar'; 
import EditorBubbleMenu from './EditorBubbleMenu';
import { ResizableImage } from './ResizableImage';

// ✨ 가장 중요한 부분: 새로 만든 editor.css 파일을 여기서 불러옵니다.
import './editor.css';

// 커스텀 이미지 확장은 에디터 설정의 일부이므로 여기에 둡니다.
const CustomImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), width: { default: null } }; },
  addNodeView() { return ReactNodeViewRenderer(ResizableImage); },
});

// 컴포넌트 이름을 역할에 맞게 변경합니다. (예: TiptapEditor)
function TiptapEditor({ userPrompt, setUserPrompt }) {

  // 이미지 파일 처리 로직은 에디터의 핵심 기능과 관련이 깊으므로 여기에 둡니다.
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

  return (
    <div className="editor-wrapper">
      {/* advanced-editor 클래스는 이제 불필요하므로 제거해도 됩니다. */}
      <Toolbar editor={editor} handleImageFiles={handleImageFiles} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapEditor;