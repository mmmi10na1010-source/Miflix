import React, { useEffect, useRef } from 'react';

interface AdSlotProps {
  htmlContent?: string;
  className?: string;
  label?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  htmlContent,
  className = '',
  label = 'مساحة إعلانية'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlContent || !htmlContent.trim()) return;

    // Clean previous scripts
    containerRef.current.innerHTML = '';

    // Create a temporary div to parse HTML and scripts
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent.trim();

    // Append standard elements
    Array.from(tempDiv.childNodes).forEach(node => {
      if (node.nodeName === 'SCRIPT') {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        containerRef.current?.appendChild(newScript);
      } else {
        containerRef.current?.appendChild(node.cloneNode(true));
      }
    });
  }, [htmlContent]);

  if (!htmlContent || !htmlContent.trim()) {
    return null;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center my-4 overflow-hidden rounded-xl border border-slate-800 bg-[#0c1420]/80 p-2 text-center ${className}`}>
      <span className="text-[10px] text-slate-500 mb-1 select-none font-sans uppercase tracking-wider">
        {label}
      </span>
      <div ref={containerRef} className="w-full flex items-center justify-center overflow-x-auto min-h-[50px]" />
    </div>
  );
};
