import type { CheckpointWithTimes } from '../types';
import type { IDataGridAdapter } from '../components/grid/GridAdapter';
import { CheckpointGridSchema } from './GridSchema';

export interface GridData {
  id: number;
  name: string;
  type: string;
  distance: number;
  pace: number;
  interval: number;
  restTime: number;
  date?: string;
  arrivalTime?: string;
  departureTime?: string;
}

export interface GridChangeEvent {
  rowIndex: number;
  columnKey: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface GridReorderEvent {
  newOrder: number[];
}

export interface GridRemoveEvent {
  removedIds: number[];
}

export interface DistanceError {
  id: number;
  message: string;
}

export class TableLogic implements IDataGridAdapter<CheckpointWithTimes, GridChangeEvent, GridReorderEvent, GridRemoveEvent> {
  static convertCheckpointsToGridData(checkpoints: CheckpointWithTimes[]): GridData[] {
    return checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      name: checkpoint.name,
      type: checkpoint.type,
      distance: checkpoint.distance,
      pace: checkpoint.pace,
      interval: checkpoint.interval,
      restTime: checkpoint.restTime,
      date: checkpoint.date || '',
      arrivalTime: checkpoint.arrivalTime || '',
      departureTime: checkpoint.departureTime || '',
    }));
  }

  convertToGridFormat(data: CheckpointWithTimes[]): unknown[][] {
    return TableLogic.convertCheckpointsToGridData(data).map((item: GridData) => [
      item.id,
      item.name,
      item.type,
      item.distance,
      item.pace,
      item.interval,
      item.restTime,
      item.date,
      item.arrivalTime,
      item.departureTime,
    ]);
  }

  processChange(
    event: GridChangeEvent,
    checkpoints: CheckpointWithTimes[],
    onCheckpointChange: (id: number, field: string, value: string | number) => void
  ): boolean {
    return TableLogic.processFieldChange(event, checkpoints, onCheckpointChange);
  }

  static processFieldChange(
    event: GridChangeEvent,
    checkpoints: CheckpointWithTimes[],
    onCheckpointChange: (id: number, field: string, value: string | number) => void
  ): boolean {
    const { rowIndex, columnKey, oldValue, newValue } = event;
    
    if (oldValue === newValue) return false;
    
    const checkpoint = checkpoints[rowIndex];
    if (!checkpoint) return false;

    // スキーマベースの編集可能列チェック
    const editableColumns = CheckpointGridSchema.getEditableColumnKeys();
    if (!editableColumns.includes(columnKey)) return false;

    // 列キーをそのまま使用（抽象化により直接マッピング不要）
    onCheckpointChange(checkpoint.id, columnKey, newValue as string | number);
    
    return columnKey === CheckpointGridSchema.COLUMN_KEYS.DISTANCE;
  }

  processReorder(
    event: GridReorderEvent,
    checkpoints: CheckpointWithTimes[],
    onReorderCheckpoints?: (newOrder: number[]) => void
  ): boolean {
    return TableLogic.processReorder(event, checkpoints, onReorderCheckpoints);
  }

  static processReorder(
    event: GridReorderEvent,
    checkpoints: CheckpointWithTimes[],
    onReorderCheckpoints?: (newOrder: number[]) => void
  ): boolean {
    const { newOrder } = event;
    
    if (!onReorderCheckpoints || !newOrder || newOrder.length !== checkpoints.length) {
      return false;
    }
    
    const currentOrder = checkpoints.map(cp => cp.id);
    if (JSON.stringify(currentOrder) === JSON.stringify(newOrder)) {
      return false;
    }
    
    const allIdsExist = newOrder.every(id => checkpoints.some(cp => cp.id === id));
    if (!allIdsExist) {
      return false;
    }
    
    onReorderCheckpoints(newOrder);
    return true;
  }

  processRemove(
    event: GridRemoveEvent,
    checkpoints: CheckpointWithTimes[],
    onRemoveCheckpoint?: (id: number) => void
  ): void {
    return TableLogic.processRemove(event, checkpoints, onRemoveCheckpoint);
  }

  static processRemove(
    event: GridRemoveEvent,
    checkpoints: CheckpointWithTimes[],
    onRemoveCheckpoint?: (id: number) => void
  ): void {
    if (!onRemoveCheckpoint || !event.removedIds.length) return;
    
    event.removedIds.forEach(id => {
      const checkpoint = checkpoints.find(cp => cp.id === id);
      if (checkpoint) {
        onRemoveCheckpoint(id);
      }
    });
  }

  checkDataIntegrity(data: CheckpointWithTimes[]): Set<number> {
    const gridData = TableLogic.convertCheckpointsToGridData(data);
    return TableLogic.checkDistanceErrors(gridData);
  }

  static checkDistanceErrors(gridData: GridData[]): Set<number> {
    const errorIds = new Set<number>();
    const minCheckIndex = CheckpointGridSchema.getMinimumCheckRowIndex();
    
    for (let i = minCheckIndex; i < gridData.length; i++) {
      const current = gridData[i];
      const previous = gridData[i - 1];
      
      if (current && previous && 
          current.distance !== null && previous.distance !== null &&
          !CheckpointGridSchema.validateDistanceOrder(current.distance, previous.distance)) {
        errorIds.add(current.id);
      }
    }
    
    return errorIds;
  }

  validateMove(
    sourceIndices: number[],
    targetIndex: number
  ): boolean {
    return TableLogic.validateRowMove(sourceIndices, targetIndex);
  }

  static validateRowMove(
    sourceRows: number[],
    targetIndex: number
  ): boolean {
    const hasProtectedRows = sourceRows.some(row => CheckpointGridSchema.isProtectedRow(row));
    const targetInProtectedArea = CheckpointGridSchema.isProtectedRow(targetIndex);
    
    return !(hasProtectedRows || targetInProtectedArea);
  }

  validateRemove(index: number): boolean {
    return TableLogic.validateRowRemove(index);
  }

  static validateRowRemove(rowIndex: number): boolean {
    return !CheckpointGridSchema.isProtectedRow(rowIndex);
  }

  static identifyRemovedItems(
    currentData: GridData[],
    previousData: GridData[]
  ): number[] {
    const currentIds = new Set(currentData.map(item => item.id));
    return previousData
      .filter(item => !currentIds.has(item.id))
      .map(item => item.id);
  }

  createDebouncer(
    callback: () => void,
    delay: number = 200
  ): {
    execute: () => void;
    cancel: () => void;
    cleanup: () => void;
  } {
    return TableLogic.createDebouncer(callback, delay);
  }

  static createDebouncer(
    callback: () => void,
    delay: number = 200
  ): {
    execute: () => void;
    cancel: () => void;
    cleanup: () => void;
  } {
    let timeoutId: number | null = null;
    
    return {
      execute: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(callback, delay);
      },
      cancel: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
      cleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
  }
}