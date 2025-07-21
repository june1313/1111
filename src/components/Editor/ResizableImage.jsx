// src/ResizableImage.jsx

import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export const ResizableImage = ({ node, updateAttributes, selected }) => {
  // img 태그를 직접 참조하기 위해 ref를 사용합니다.
  const imgRef = useRef(null);

  const handleResize = (e) => {
    // 기본 동작 방지
    e.preventDefault();

    const startX = e.clientX;
    // node.attrs.width 대신, 렌더링된 이미지의 실제 너비(px)를 가져옵니다.
    const startWidth = imgRef.current.offsetWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      updateAttributes({ width: Math.max(50, newWidth) }); // 최소 너비 50px
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper className={`resizable-image-container ${selected ? 'selected' : ''}`}>
      {/* ref를 img 태그에 연결하고, 너비 스타일에 'px' 단위를 붙여줍니다. */}
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt=""
        style={{ width: node.attrs.width }}
      />
      {selected && (
        <div className="resize-handle" onMouseDown={handleResize}></div>
      )}
    </NodeViewWrapper>
  );
};