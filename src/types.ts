export interface Checkpoint {
  id: number;
  name: string;
  type: string;
  distance: number;
  pace: number;
  interval: number;
  restTime: number;
  hasError?: boolean;
}

export interface CheckpointWithTimes extends Checkpoint {
  date?: string;
  arrivalTime?: string;
  departureTime?: string;
}

export interface Column {
  id: string;
  label: string;
  width: string;
}

export interface SortableRowProps {
  checkpoint: CheckpointWithTimes;
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  columns: Column[];
}

export interface DraggableColumnProps {
  column: Column;
  onResize: (columnId: string, newWidth: string) => void;
  tableRef: React.RefObject<HTMLTableElement | null>;
}

export interface ScheduleTableProps {
  checkpoints: CheckpointWithTimes[];
  columns: Column[];
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  onColumnResize: (columnId: string, newWidth: string) => void;
  onDragEnd: (event: any) => void;
}