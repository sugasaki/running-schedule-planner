import React, { useState, useMemo, useRef } from 'react';
import { Play, MapPin, GripVertical, GripHorizontal } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Checkpoint {
  id: number;
  name: string;
  type: string;
  distance: number;
  pace: number;
  interval: number;
  restTime: number;
  hasError?: boolean;
}

interface SortableRowProps {
  checkpoint: Checkpoint & {
    date?: string;
    arrivalTime?: string;
    departureTime?: string;
    hasError?: boolean;
  };
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  columns: Array<{ id: string; label: string; width: string }>;
}

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

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${
        checkpoint.hasError
          ? 'bg-red-100'
          : checkpoint.type === 'ゴール'
          ? 'bg-yellow-50'
          : checkpoint.type === '集合'
          ? 'bg-green-50'
          : checkpoint.type === 'スタート'
          ? 'bg-blue-50'
          : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Fixed NO column */}
      <td className="border px-4 py-2 cursor-move" style={{ width: '60px' }} {...attributes} {...listeners}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          {checkpoint.id}
        </div>
      </td>

      {/* Dynamic columns based on column order */}
      {columns.map((column) => {
        switch (column.id) {
          case 'name':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                <input
                  type="text"
                  value={checkpoint.name}
                  onChange={(e) => onCheckpointChange(checkpoint.id, 'name', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                />
              </td>
            );
          case 'type':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                <input
                  type="text"
                  value={checkpoint.type}
                  onChange={(e) => onCheckpointChange(checkpoint.id, 'type', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                />
              </td>
            );
          case 'distance':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
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
              </td>
            );
          case 'pace':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                <input
                  type="number"
                  value={checkpoint.pace}
                  onChange={(e) => onCheckpointChange(checkpoint.id, 'pace', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                  disabled={checkpoint.id <= 1 || checkpoint.interval === 0}
                />
              </td>
            );
          case 'interval':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                <input
                  type="number"
                  step="0.1"
                  value={checkpoint.interval}
                  onChange={(e) => onCheckpointChange(checkpoint.id, 'interval', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                  disabled={checkpoint.id <= 1}
                />
              </td>
            );
          case 'restTime':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                <input
                  type="number"
                  value={checkpoint.restTime}
                  onChange={(e) => onCheckpointChange(checkpoint.id, 'restTime', e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none"
                />
              </td>
            );
          case 'date':
            return (
              <td key={column.id} className="border px-4 py-2 font-mono" style={{ width: column.width || 'auto' }}>{checkpoint.date}</td>
            );
          case 'arrivalTime':
            return (
              <td key={column.id} className="border px-4 py-2 font-mono" style={{ width: column.width || 'auto' }}>
                {checkpoint.hasError ? (
                  <span className="text-red-600">--:--</span>
                ) : (
                  checkpoint.arrivalTime
                )}
              </td>
            );
          case 'departureTime':
            return (
              <td key={column.id} className="border px-4 py-2 font-mono" style={{ width: column.width || 'auto' }}>
                {checkpoint.hasError ? (
                  <span className="text-red-600">--:--</span>
                ) : (
                  checkpoint.departureTime
                )}
              </td>
            );
          case 'actions':
            return (
              <td key={column.id} className="border px-4 py-2" style={{ width: column.width || 'auto' }}>
                {checkpoint.id > 1 && (
                  <span className="text-red-600 text-xs cursor-pointer">削除</span>
                )}
              </td>
            );
          default:
            return <td key={column.id} className="border px-4 py-2"></td>;
        }
      })}
    </tr>
  );
};

const RunningScheduleCalculator = () => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [startDateTime, setStartDateTime] = useState('2025-06-07T08:30');
  const [columns, setColumns] = useState([
    { id: 'name', label: '場所', width: '150px' },
    { id: 'type', label: '区分', width: '100px' },
    { id: 'distance', label: '距離\n(km)', width: '100px' },
    { id: 'pace', label: 'ペース\n(分/km)', width: '100px' },
    { id: 'interval', label: '間隔\n(km)', width: '100px' },
    { id: 'restTime', label: '休憩\n(分)', width: '100px' },
    { id: 'date', label: '日付', width: '100px' },
    { id: 'arrivalTime', label: '到着', width: '100px' },
    { id: 'departureTime', label: '出発', width: '100px' },
    { id: 'actions', label: '操作', width: '80px' },
  ]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    { id: 0, name: '御徒町', type: '集合', distance: 0, pace: 0, interval: 0, restTime: 0 },
    { id: 1, name: '御器所', type: 'スタート', distance: 0, pace: 0, interval: 0, restTime: 30 },
    { id: 2, name: 'そばよし', type: '', distance: 2.74, pace: 10, interval: 5, restTime: 20 },
    { id: 3, name: 'コンビニ', type: '', distance: 10, pace: 10, interval: 4.2, restTime: 10 },
    { id: 4, name: '北池袋の肉まん研究所', type: '', distance: 19.82, pace: 10, interval: 4.2, restTime: 10 },
    { id: 5, name: '巣鴨', type: '', distance: 22.13, pace: 10, interval: 0.6, restTime: 10 },
    { id: 6, name: '谷中銀座', type: '', distance: 25.59, pace: 10, interval: 0.2, restTime: 10 },
    { id: 7, name: '新吉原花園池跡 弁天観音', type: '', distance: 28.8, pace: 10, interval: 1.1, restTime: 10 },
    { id: 8, name: '浅草寺', type: '', distance: 30.26, pace: 10, interval: 1.1, restTime: 10 },
    { id: 9, name: '両国メンチ', type: '', distance: 32.83, pace: 10, interval: 1.55, restTime: 15 },
    { id: 10, name: '高輪ゲートウェイ', type: '', distance: 44.44, pace: 10, interval: 1.78, restTime: 10 },
    { id: 11, name: '目黒川', type: '', distance: 47.96, pace: 10, interval: 1.05, restTime: 10 },
    { id: 12, name: '祐天寺の稲毛屋天野屋', type: '', distance: 51.35, pace: 10, interval: 3.5, restTime: 15 },
    { id: 12, name: '武蔵小山の鳥勇', type: '', distance: 54.68, pace: 10, interval: 1.66, restTime: 15 },
    { id: 13, name: '自由が丘の腰塚のメンチ', type: '', distance: 59.24, pace: 10, interval: 3.63, restTime: 15 },
    { id: 14, name: '三茶のキャロットタワー', type: '', distance: 64.62, pace: 10, interval: 0, restTime: 20 },
    { id: 15, name: '下北沢', type: '', distance: 66.91, pace: 10, interval: 11, restTime: 10 },
    { id: 16, name: '椎名町の南天そば', type: '', distance: 80.09, pace: 10, interval: 0, restTime: 30 },
    { id: 17, name: 'コンビニ', type: '', distance: 87.3, pace: 10, interval: 0, restTime: 10 },
    { id: 18, name: '日暮里の一由そば', type: '', distance: 96.71, pace: 10, interval: 0, restTime: 30 },
    { id: 19, name: '平井駅(コンビニ)', type: '', distance: 105.23, pace: 10, interval: 0, restTime: 15 },
    { id: 20, name: '砂町銀座', type: '', distance: 109.87, pace: 10, interval: 0, restTime: 10 },
    { id: 21, name: '横十間川', type: '', distance: 111.34, pace: 10, interval: 0, restTime: 10 },
    { id: 22, name: '亀戸神社', type: '', distance: 114.01, pace: 10, interval: 0, restTime: 10 },
    { id: 23, name: 'スカイツリー', type: '', distance: 115.63, pace: 10, interval: 0, restTime: 10 },
    { id: 24, name: '御徒町', type: 'ゴール', distance: 120.37, pace: 10, interval: 0, restTime: 20 },
    { id: 25, name: '燕湯', type: '銭湯', distance:120.5, pace: 10, interval: 0, restTime: 60 },
    { id: 26, name: '打上', type: '打上', distance:121.5, pace: 10, interval: 0, restTime: 120 },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const calculateTimes = useMemo(() => {
    // Validate distances and mark checkpoints with errors
    const validatedCheckpoints = [...checkpoints];

    // First pass: mark checkpoints with distance errors
    for (let i = 1; i < validatedCheckpoints.length; i++) {
      const current = validatedCheckpoints[i];
      const prev = validatedCheckpoints[i-1];

      // Skip the first two checkpoints (集合 and スタート)
      if (i <= 1) {
        current.hasError = false;
        continue;
      }

      // Check if current distance is less than previous distance
      if (current.distance < prev.distance) {
        current.hasError = true;
      } else {
        current.hasError = false;
      }
    }

    // Recalculate intervals based on distances
    const checkpointsWithUpdatedIntervals = validatedCheckpoints.map((checkpoint, index, array) => {
      if (index <= 1) return checkpoint; // Skip for first two checkpoints (集合 and スタート)

      // Calculate interval based on the difference in distance from the previous checkpoint
      const prevCheckpoint = array[index - 1];
      // Round to 2 decimal places to avoid floating-point precision issues
      const calculatedInterval = Number((checkpoint.distance - prevCheckpoint.distance).toFixed(2));

      // Only update if the calculated interval is different from the stored interval
      // This prevents unnecessary updates when distances haven't changed
      return {
        ...checkpoint,
        interval: calculatedInterval > 0 ? calculatedInterval : checkpoint.interval
      };
    });

    // Now calculate times based on updated intervals
    const startTime = new Date(startDateTime);
    let currentTime = new Date(startTime);

    return checkpointsWithUpdatedIntervals.map((checkpoint) => {
      if (checkpoint.id === 0) {
        return {
          ...checkpoint,
          date: formatDate(currentTime),
          arrivalTime: formatTime(currentTime),
          departureTime: checkpoint.restTime > 0
            ? formatTime(new Date(currentTime.getTime() + checkpoint.restTime * 60000))
            : '',
        };
      }

      // Skip time calculation for checkpoints with errors
      if (!checkpoint.hasError && checkpoint.interval > 0 && checkpoint.pace > 0) {
        currentTime = new Date(currentTime.getTime() + checkpoint.interval * checkpoint.pace * 60000);
      }

      const date = formatDate(currentTime);
      const arrivalTime = formatTime(currentTime);

      if (checkpoint.restTime > 0) {
        currentTime = new Date(currentTime.getTime() + checkpoint.restTime * 60000);
      }

      return {
        ...checkpoint,
        date,
        arrivalTime,
        departureTime: checkpoint.restTime > 0 ? formatTime(currentTime) : '',
      };
    });
  }, [startDateTime, checkpoints]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Check if this is a column drag
    if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      const activeColumnId = active.id.replace('column-', '');
      const overColumnId = over.id.toString().replace('column-', '');

      // Don't allow moving the 'no' column
      if (activeColumnId === 'no' || overColumnId === 'no') return;

      setColumns((columns) => {
        const oldIndex = columns.findIndex((col) => col.id === activeColumnId);
        const newIndex = columns.findIndex((col) => col.id === overColumnId);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(columns, oldIndex, newIndex);
        }
        return columns;
      });
    } else {
      // This is a row drag
      setCheckpoints((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addCheckpoint = () => {
    const newId = Math.max(...checkpoints.map(cp => cp.id)) + 1;
    setCheckpoints(prev => [...prev, {
      id: newId,
      name: '新しいチェックポイント',
      type: '',
      distance: 0,
      pace: 10,
      interval: 0,
      restTime: 5,
    }]);
  };

  const handleCheckpointChange = (id: number, field: string, value: string | number) => {
    setCheckpoints(prev => {
      const updatedCheckpoints = prev.map(cp =>
        cp.id === id
          ? {
              ...cp,
              [field]: ['distance', 'pace', 'interval', 'restTime'].includes(field)
                ? Number(value)
                : value,
            }
          : cp
      );

      // If distance was changed, update intervals for subsequent checkpoints
      if (field === 'distance') {
        const changedIndex = updatedCheckpoints.findIndex(cp => cp.id === id);
        if (changedIndex > 1 && changedIndex < updatedCheckpoints.length - 1) {
          // Update the next checkpoint's interval based on the new distance
          const nextCheckpoint = updatedCheckpoints[changedIndex + 1];
          if (nextCheckpoint) {
            // Round to 2 decimal places to avoid floating-point precision issues
            const newInterval = Number((nextCheckpoint.distance - Number(value)).toFixed(2));
            if (newInterval > 0) {
              updatedCheckpoints[changedIndex + 1] = {
                ...nextCheckpoint,
                interval: newInterval
              };
            }
          }
        }
      }

      return updatedCheckpoints;
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Play className="w-6 h-6" />
          2025年5月18日 街ラン
        </h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スタート日時
          </label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table ref={tableRef} className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                {/* No column is always first and fixed */}
                <th className="border px-4 py-2 text-left">No</th>

                {/* Draggable columns */}
                <SortableContext
                  items={columns.map(col => `column-${col.id}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((column) => (
                    <DraggableColumn
                      key={column.id}
                      column={column}
                      tableRef={tableRef}
                      onResize={(columnId, newWidth) => {
                        setColumns(cols =>
                          cols.map(col =>
                            col.id === columnId ? { ...col, width: newWidth } : col
                          )
                        );
                      }}
                    />
                  ))}
                </SortableContext>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={calculateTimes}
                strategy={verticalListSortingStrategy}
              >
                {calculateTimes.map((checkpoint) => (
                  <SortableRow
                    key={checkpoint.id}
                    checkpoint={checkpoint}
                    onCheckpointChange={handleCheckpointChange}
                    columns={columns}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      <div className="mt-4">
        <button
          onClick={addCheckpoint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          チェックポイント追加
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">使い方：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• スタート日時を設定してください（日付をまたぐ長時間イベントにも対応）</li>
            <li>• 各チェックポイントの距離、ペース、間隔、休憩時間を個別に設定できます</li>
            <li>• 到着・出発時刻は自動計算されます（月/日 時:分 形式で表示）</li>
            <li>• 集合時間、スタート時間、ゴール時間を区別して管理できます</li>
            <li>• 休憩時間0分の場合は出発時刻が表示されません</li>
            <li>• 行の左端のグリップアイコンをドラッグして順序を変更できます</li>
            <li>• 列の見出しのグリップアイコンをドラッグして列の順序を変更できます</li>
            <li>• 列の右端をドラッグして列の幅を調整できます</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">計算例：</h3>
          <p className="text-sm text-amber-700">
            総距離: {checkpoints[checkpoints.length - 3]?.distance || 0}km |
            推定総時間: {(() => {
              const start = new Date(startDateTime);
              const lastCheckpoint = calculateTimes[calculateTimes.length - 3];
              if (lastCheckpoint) {
                const [month, day] = lastCheckpoint.date.split('/');
                const [hours, minutes] = lastCheckpoint.arrivalTime.split(':');
                const end = new Date(
                  start.getFullYear(),
                  parseInt(month) - 1,
                  parseInt(day),
                  parseInt(hours),
                  parseInt(minutes)
                );
                const diffMs = end.getTime() - start.getTime();
                const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
                return `${diffHours}時間`;
              }
              return '計算中...';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Draggable and resizable column component
interface ColumnProps {
  column: {
    id: string;
    label: string;
    width: string;
  };
  onResize: (columnId: string, newWidth: string) => void;
  tableRef: React.RefObject<HTMLTableElement | null>; // Reference to the table for positioning
}

const DraggableColumn: React.FC<ColumnProps> = ({ column, onResize, tableRef }) => {
  // State for tracking resize operation
  const [resizeWidth, setResizeWidth] = useState(0);

  // Use a ref instead of state to avoid re-renders during resize
  const isResizingRef = useRef(false);

  // Function to update resize state without triggering re-renders
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

  // Reference to the table header cell
  const thRef = useRef<HTMLTableCellElement>(null);

  // Excel-like resize approach with visual guide
  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Get initial values
    const startX = e.pageX;
    const startWidth = thRef.current?.offsetWidth || 100;
    setResizeWidth(startWidth);

    // Show resize indicator
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('select-none');

    // Get table position for accurate guide positioning
    const tableRect = tableRef.current?.getBoundingClientRect();
    const tableTop = tableRect?.top || 0;
    const tableHeight = tableRef.current?.offsetHeight || 0;

    // Create resize guide element
    const resizeGuide = document.createElement('div');
    resizeGuide.id = 'column-resize-guide';
    resizeGuide.style.position = 'absolute';
    resizeGuide.style.top = `${tableTop}px`;
    resizeGuide.style.height = `${tableHeight}px`;
    resizeGuide.style.width = '2px';
    resizeGuide.style.backgroundColor = '#2563eb'; // Blue color
    resizeGuide.style.zIndex = '1000';

    // Add width indicator tooltip
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

    // Position the guide initially
    const initialLeft = thRef.current ? thRef.current.getBoundingClientRect().right : 0;
    resizeGuide.style.left = `${initialLeft}px`;
    widthIndicator.style.left = `${initialLeft - 20}px`;

    // Create the resize function
    const resize = (moveEvent: MouseEvent) => {
      // Calculate new width
      const newWidth = startWidth + (moveEvent.pageX - startX);
      setResizeWidth(newWidth);

      // Update guide position
      const left = thRef.current ?
        thRef.current.getBoundingClientRect().left + newWidth :
        initialLeft + (moveEvent.pageX - startX);

      resizeGuide.style.left = `${left}px`;
      widthIndicator.style.left = `${left - 20}px`;
      widthIndicator.textContent = `${Math.round(newWidth)}px`;
    };

    // Create the stop function
    const stopResize = () => {
      // Clean up event listeners
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);

      // Remove visual elements
      document.body.removeChild(resizeGuide);
      document.body.removeChild(widthIndicator);
      document.body.style.cursor = '';
      document.body.classList.remove('select-none');
      setIsResizing(false);

      // Apply and save the new width
      if (thRef.current) {
        thRef.current.style.width = `${resizeWidth}px`;
        onResize(column.id, `${resizeWidth}px`);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };

  // Handle touch events for mobile
  const startTouchResize = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;

    e.preventDefault();
    e.stopPropagation();

    // Initial values
    const touch = e.touches[0];
    const startX = touch.pageX;
    const startWidth = thRef.current?.offsetWidth || 100;

    // Add visual feedback
    const resizeHandle = e.currentTarget;
    resizeHandle.classList.add('bg-blue-500');
    document.body.classList.add('select-none');

    // Create the resize function
    const resize = (moveEvent: TouchEvent) => {
      if (!thRef.current || moveEvent.touches.length !== 1) return;

      // Calculate new width without minimum restriction
      const newWidth = startWidth + (moveEvent.touches[0].pageX - startX);

      // Apply new width directly
      thRef.current.style.width = `${newWidth}px`;
    };

    // Create the stop function
    const stopResize = () => {
      // Clean up event listeners
      document.removeEventListener('touchmove', resize);
      document.removeEventListener('touchend', stopResize);

      // Remove visual feedback
      resizeHandle.classList.remove('bg-blue-500');
      document.body.classList.remove('select-none');

      // Save the new width
      if (thRef.current) {
        onResize(column.id, `${thRef.current.offsetWidth}px`);
      }
    };

    // Add event listeners
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
          <span dangerouslySetInnerHTML={{ __html: column.label.replace('\n', '<br/>') }} />
        </div>
        <div className="flex items-center">
          <div className="cursor-move" {...attributes} {...listeners}>
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Simple resize handle */}
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

export default RunningScheduleCalculator;
