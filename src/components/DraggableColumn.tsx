import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import type { DraggableColumnProps } from '../types';

const DraggableColumn: React.FC<DraggableColumnProps> = ({ column, onResize, tableRef }) => {
  const [resizeWidth, setResizeWidth] = useState(0);
  const isResizingRef = useRef(false);

  const setIsResizing = (value: boolean) => {
    isResizingRef.current = value;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${column.id}` });

  const thRef = useRef<HTMLTableCellElement>(null);

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.pageX;
    const startWidth = thRef.current?.offsetWidth || 100;
    setResizeWidth(startWidth);

    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('select-none');

    const tableRect = tableRef.current?.getBoundingClientRect();
    const tableTop = tableRect?.top || 0;
    const tableHeight = tableRef.current?.offsetHeight || 0;

    const resizeGuide = document.createElement('div');
    resizeGuide.id = 'column-resize-guide';
    resizeGuide.style.position = 'absolute';
    resizeGuide.style.top = `${tableTop}px`;
    resizeGuide.style.height = `${tableHeight}px`;
    resizeGuide.style.width = '2px';
    resizeGuide.style.backgroundColor = '#2563eb';
    resizeGuide.style.zIndex = '1000';

    const widthIndicator = document.createElement('div');
    widthIndicator.id = 'width-indicator';
    widthIndicator.style.position = 'absolute';
    widthIndicator.style.top = `${tableTop - 25}px`;
    widthIndicator.style.backgroundColor = '#2563eb';
    widthIndicator.style.color = 'white';
    widthIndicator.style.padding = '2px 6px';
    widthIndicator.style.borderRadius = '4px';
    widthIndicator.style.fontSize = '12px';
    widthIndicator.style.zIndex = '1001';
    widthIndicator.textContent = `${startWidth}px`;

    document.body.appendChild(resizeGuide);
    document.body.appendChild(widthIndicator);

    const initialLeft = thRef.current ? thRef.current.getBoundingClientRect().right : 0;
    resizeGuide.style.left = `${initialLeft}px`;
    widthIndicator.style.left = `${initialLeft - 20}px`;

    const resize = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      setResizeWidth(newWidth);

      const left = thRef.current ?
        thRef.current.getBoundingClientRect().left + newWidth :
        initialLeft + (moveEvent.pageX - startX);

      resizeGuide.style.left = `${left}px`;
      widthIndicator.style.left = `${left - 20}px`;
      widthIndicator.textContent = `${Math.round(newWidth)}px`;
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);

      document.body.removeChild(resizeGuide);
      document.body.removeChild(widthIndicator);
      document.body.style.cursor = '';
      document.body.classList.remove('select-none');
      setIsResizing(false);

      if (thRef.current) {
        thRef.current.style.width = `${resizeWidth}px`;
        onResize(column.id, `${resizeWidth}px`);
      }
    };

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };

  const startTouchResize = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const startX = touch.pageX;
    const startWidth = thRef.current?.offsetWidth || 100;

    const resizeHandle = e.currentTarget;
    resizeHandle.classList.add('bg-blue-500');
    document.body.classList.add('select-none');

    const resize = (moveEvent: TouchEvent) => {
      if (!thRef.current || moveEvent.touches.length !== 1) return;

      const newWidth = startWidth + (moveEvent.touches[0].pageX - startX);
      thRef.current.style.width = `${newWidth}px`;
    };

    const stopResize = () => {
      document.removeEventListener('touchmove', resize);
      document.removeEventListener('touchend', stopResize);

      resizeHandle.classList.remove('bg-blue-500');
      document.body.classList.remove('select-none');

      if (thRef.current) {
        onResize(column.id, `${thRef.current.offsetWidth}px`);
      }
    };

    document.addEventListener('touchmove', resize, { passive: false });
    document.addEventListener('touchend', stopResize);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    width: column.width || 'auto',
  };

  return (
    <th
      ref={(node) => {
        setNodeRef(node);
        thRef.current = node;
      }}
      style={style}
      className="border px-4 py-2 text-left relative"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-grow">
          <span dangerouslySetInnerHTML={{ __html: column.label.replace('\\n', '<br/>') }} />
        </div>
        <div className="flex items-center">
          <div className="cursor-move" {...attributes} {...listeners}>
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div
        className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-blue-300 hover:opacity-50"
        style={{ zIndex: 20 }}
        onMouseDown={startResize}
        onTouchStart={startTouchResize}
      >
        <div className="h-full w-1 mx-auto bg-gray-300" />
      </div>
    </th>
  );
};

export default DraggableColumn;