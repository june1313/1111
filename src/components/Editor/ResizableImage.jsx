// src/ResizableImage.jsx

import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export const ResizableImage = ({ node, updateAttributes, selected }) => {
  const imgRef = useRef(null);

  const handleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = imgRef.current.offsetWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      updateAttributes({ width: Math.max(50, newWidth) });
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
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt=""
        style={{ width: node.attrs.width ? `${node.attrs.width}px` : '100%' }}
      />
      {selected && (
        <div className="resize-handle" onMouseDown={handleResize}></div>
      )}
    </NodeViewWrapper>
  );
};