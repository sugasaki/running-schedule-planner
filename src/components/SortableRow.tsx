import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { SortableRowProps } from '../types';

const SortableRow: React.FC<SortableRowProps> = ({ checkpoint, onCheckpointChange, columns }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: checkpoint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCellContent = (column: { id: string; width?: string }) => {
    switch (column.id) {
      case 'name':
        return (
          <input
            type="text"
            value={checkpoint.name}
            onChange={(e) => onCheckpointChange(checkpoint.id, 'name', e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none"
          />
        );
      case 'type':
        return (
          <input
            type="text"
            value={checkpoint.type}
            onChange={(e) => onCheckpointChange(checkpoint.id, 'type', e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none"
          />
        );
      case 'distance':
        return (
          <>
            <input
              type="number"
              step="0.1"
              value={checkpoint.distance}
              onChange={(e) => onCheckpointChange(checkpoint.id, 'distance', e.target.value)}
              className={`w-full bg-transparent border-none focus:outline-none ${checkpoint.hasError ? 'text-red-600 font-bold' : ''}`}
              disabled={checkpoint.id <= 1}
            />
            {checkpoint.hasError && (
              <div className="text-red-600 text-xs mt-1">前のチェックポイントより距離が小さいです</div>
            )}
          </>
        );
      case 'pace':
        return (
          <input
            type="number"
            value={checkpoint.pace}
            onChange={(e) => onCheckpointChange(checkpoint.id, 'pace', e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none"
            disabled={checkpoint.id <= 1 || checkpoint.interval === 0}
          />
        );
      case 'interval':
        return (
          <input
            type="number"
            step="0.1"
            value={checkpoint.interval}
            onChange={(e) => onCheckpointChange(checkpoint.id, 'interval', e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none"
            disabled={checkpoint.id <= 1}
          />
        );
      case 'restTime':
        return (
          <input
            type="number"
            value={checkpoint.restTime}
            onChange={(e) => onCheckpointChange(checkpoint.id, 'restTime', e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none"
          />
        );
      case 'date':
        return <span className="font-mono">{checkpoint.date}</span>;
      case 'arrivalTime':
        return (
          <span className="font-mono">
            {checkpoint.hasError ? (
              <span className="text-red-600">--:--</span>
            ) : (
              checkpoint.arrivalTime
            )}
          </span>
        );
      case 'departureTime':
        return (
          <span className="font-mono">
            {checkpoint.hasError ? (
              <span className="text-red-600">--:--</span>
            ) : (
              checkpoint.departureTime
            )}
          </span>
        );
      case 'actions':
        return (
          <>
            {checkpoint.id > 1 && (
              <span className="text-red-600 text-xs cursor-pointer">削除</span>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getRowClassName = () => {
    const baseClass = isDragging ? 'shadow-lg' : '';
    
    if (checkpoint.hasError) return `bg-red-100 ${baseClass}`;
    if (checkpoint.type === 'ゴール') return `bg-yellow-50 ${baseClass}`;
    if (checkpoint.type === '集合') return `bg-green-50 ${baseClass}`;
    if (checkpoint.type === 'スタート') return `bg-blue-50 ${baseClass}`;
    
    return baseClass;
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={getRowClassName()}
    >
      <td className="border px-4 py-2 cursor-move" style={{ width: '60px' }} {...attributes} {...listeners}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          {checkpoint.id}
        </div>
      </td>

      {columns.map((column) => (
        <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
          {getCellContent(column)}
        </td>
      ))}
    </tr>
  );
};

export default SortableRow;