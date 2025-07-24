// frontend/src/components/Editor/ColorPickerDropdown.jsx (최종 수정본)

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

const ColorPickerDropdown = ({ icon: Icon, title, editor, colors, command }) => {
  const [isOpen, setIsOpen] = useState(false);
  // ✨ 위치를 저장할 state (top, left)
  const [position, setPosition] = useState({}); 
  
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // ✨ 드롭다운이 열릴 때마다 위치를 다시 계산하는 로직
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      
      let left = buttonRect.left; // 기본적으로 버튼 왼쪽에 맞춤

      // ✨ 만약 드롭다운이 오른쪽 화면을 벗어난다면, 위치를 왼쪽으로 당김
      if (left + dropdownRect.width > window.innerWidth) {
        left = window.innerWidth - dropdownRect.width - 8; // 8px 여유 공간
      }
      
      // ✨ 만약 드롭다운이 왼쪽 화면을 벗어난다면 (매우 드문 경우), 위치를 오른쪽으로 밀어줌
      if (left < 0) {
        left = 8;
      }
      
      setPosition({
        top: buttonRect.bottom + 4, // 버튼 바로 아래에 위치
        left: left,
      });
    }
  }, [isOpen]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleColorSelect = (color) => {
    command(color);
    setIsOpen(false);
  };

  return (
    // ✨ 이제 컨테이너가 아닌 버튼에 ref를 직접 연결
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`toolbar-button ${isOpen ? 'is-active' : ''}`}
        title={title}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={18} />
      </button>

      {isOpen && (
        // ✨ ref와 style을 패널에 직접 적용
        <div ref={dropdownRef} className="color-dropdown" style={position}>
          <div className="color-grid">
            {colors.map((color, index) => (
              <button
                key={index}
                type="button"
                className={`color-swatch-dropdown ${
                  editor.isActive('textStyle', { color }) || editor.isActive('highlight', { color })
                    ? 'is-active'
                    : ''
                }`}
                style={color ? { backgroundColor: color } : {}}
                onClick={() => handleColorSelect(color)}
                title={color || '제거'}
              >
                {!color && 'X'}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ColorPickerDropdown;