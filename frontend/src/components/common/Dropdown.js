import React, { useState, useEffect, useRef } from 'react';

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute mt-2 ${alignmentClasses[align]} z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn`}
          >
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onClick: (e) => {
                  child.props.onClick?.(e);
                  setIsOpen(false);
                },
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const DropdownItem = ({ onClick, children, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition ${className}`}
    >
      {icon && <span className="text-gray-500">{icon}</span>}
      {children}
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200" />;
};

export default Dropdown;