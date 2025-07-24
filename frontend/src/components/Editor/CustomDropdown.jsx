// frontend/src/components/Editor/CustomDropdown.jsx (버그 수정된 최종 코드)

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ value, options, onChange, renderButtonContent, buttonClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({});
  
  const containerRef = useRef(null); // ✨ 전체 컨테이너를 위한 ref
  const buttonRef = useRef(null);    // ✨ 버튼을 위한 ref
  const panelRef = useRef(null);     // ✨ 드롭다운 패널 자체를 위한 ref

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ✨ 컨테이너 외부를 클릭했는지 확인
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 드롭다운이 열릴 때마다 위치와 크기를 다시 계산
  useLayoutEffect(() => {
    // ✨ 버튼과 '패널'이 모두 존재할 때 로직 실행
    if (isOpen && buttonRef.current && panelRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const panelHeight = panelRef.current.offsetHeight; // ✨ 실제 패널의 높이를 측정

      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top, maxHeight;
      const verticalMargin = 4;

      if (spaceBelow >= panelHeight || spaceBelow >= spaceAbove) {
        top = buttonRect.bottom + verticalMargin;
        maxHeight = window.innerHeight - top - 8;
      } else {
        top = buttonRect.top - panelHeight - verticalMargin;
        maxHeight = buttonRect.top - 8;
      }
      
      const panelWidth = panelRef.current.offsetWidth;
      let left = buttonRect.left;
      if (left + panelWidth > window.innerWidth) {
        left = window.innerWidth - panelWidth - 8;
      }
      if (left < 0) {
        left = 8;
      }
      
      const buttonWidth = buttonRect.width;
      
      setPosition({ 
        top: `${top}px`, 
        left: `${left}px`, 
        maxHeight: `${maxHeight}px`,
        width: `${buttonWidth}px`
      });
    }
  }, [isOpen]);


  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    // ✨ 컨테이너 ref 설정
    <div className="custom-dropdown-container" ref={containerRef}>
      <button type="button" ref={buttonRef} className={`custom-dropdown-button ${buttonClassName}`} onClick={() => setIsOpen(!isOpen)}>
        {renderButtonContent(options.find(opt => opt.value === value))}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        // ✨ 패널 ref와 계산된 style 적용
        <div ref={panelRef} className="custom-dropdown-panel" style={position}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`custom-dropdown-option ${option.value === value ? 'is-active' : ''}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;