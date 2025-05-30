import React, { useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ScheduleTableProps } from '../types';
import SortableRow from './SortableRow';
import DraggableColumn from './DraggableColumn';

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  checkpoints,
  columns,
  onCheckpointChange,
  onColumnResize,
  onDragEnd,
}) => {
  const tableRef = useRef<HTMLTableElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <table ref={tableRef} className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2 text-left">No</th>

              <SortableContext
                items={columns.map(col => `column-${col.id}`)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <DraggableColumn
                    key={column.id}
                    column={column}
                    tableRef={tableRef}
                    onResize={onColumnResize}
                  />
                ))}
              </SortableContext>
            </tr>
          </thead>
          <tbody>
            <SortableContext
              items={checkpoints}
              strategy={verticalListSortingStrategy}
            >
              {checkpoints.map((checkpoint) => (
                <SortableRow
                  key={checkpoint.id}
                  checkpoint={checkpoint}
                  onCheckpointChange={onCheckpointChange}
                  columns={columns}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
};

export default ScheduleTable;