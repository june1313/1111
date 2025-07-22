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
import Link from '@tiptap/extension-link'; // ✨ 이 부분을 새로 import 해야 합니다!

// 분리된 컴포넌트들을 import 합니다.
import Toolbar from './Toolbar';
import EditorBubbleMenu from './EditorBubbleMenu';
import { ResizableImage } from './ResizableImage';

import './editor.css'; // editor.css 불러오기

const CustomImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), width: { default: null } }; },
  addNodeView() { return ReactNodeViewRenderer(ResizableImage); },
});

function TiptapEditor({ userPrompt, setUserPrompt }) {
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
        // link: { openOnClick: false }, // ✨ 여기는 주석 처리하거나 제거하세요. 아래 Link 확장에서 설정합니다.
        heading: { levels: [1, 2, 3] },
        underline: false,
      }),
      // ✨ 이 부분이 핵심: Link 확장 기능을 추가합니다.
      Link.configure({
        openOnClick: false, // 에디터 내에서 클릭 시 바로 이동하지 않게 (handleDOMEvents에서 제어)
        autolink: true, // URL처럼 보이는 텍스트를 자동으로 링크로 변환할지 여부
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
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target;
          if (target && target.tagName === 'A' && target.href) {
            // Shift, Ctrl/Cmd 키와 함께 클릭했을 때만 링크 열기
            if (event.shiftKey || event.ctrlKey || event.metaKey) {
              window.open(target.href, '_blank');
              event.preventDefault();
              return true;
            }
            // (선택 사항) Shift/Ctrl/Cmd 키 없이 단순 클릭 시에도 링크를 열려면 이 부분을 활성화
            else {
              window.open(target.href, '_blank');
              event.preventDefault();
              return true;
            }
          }
          return false;
        },
      },
    },
  });

  if (!editor) { return null; }

  return (
    <div className="editor-wrapper">
      <Toolbar editor={editor} handleImageFiles={handleImageFiles} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default TiptapEditor;