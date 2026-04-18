import { useState } from 'react';

export function Tooltip({ children, content, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div
          className={`absolute z-50 ${positionClasses[position]} px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 shadow-xl text-xs text-slate-300 whitespace-nowrap max-w-[240px] pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
