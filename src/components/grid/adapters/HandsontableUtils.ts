import Handsontable from 'handsontable';
import type { HotTableClass } from '@handsontable/react';
import type { CheckpointWithTimes } from '../../../types';
import { TableLogic } from '../../../services/TableLogic';
import { GridEventTranslator } from '../GridEventTranslator';

export const transformCheckpointsToTableData = (checkpoints: CheckpointWithTimes[]) => {
  const adapter = new TableLogic();
  return adapter.convertToGridFormat(checkpoints);
};

export const buildCellChangeHandler = (
  checkpoints: CheckpointWithTimes[],
  onCheckpointChange: (id: number, field: string, value: string | number) => void,
  recheckAllRows?: () => void,
  hotRef?: React.RefObject<HotTableClass | null>
) => {
  return (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return;

    let distanceChanged = false;

    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (oldValue !== newValue && row !== null && prop !== null) {
        if (!hotRef?.current) return;

        const hotInstance = hotRef.current.hotInstance;
        if (!hotInstance) return;

        const cellId = hotInstance.getDataAtCell(row, 0);
        const checkpoint = checkpoints.find(cp => cp.id === cellId);
        if (!checkpoint) return;

        const checkpointIndex = checkpoints.findIndex(cp => cp.id === cellId);
        if (checkpointIndex === -1) return;

        const event = GridEventTranslator.translateCellChange(
          checkpointIndex,
          prop as number,
          oldValue,
          newValue
        );
        if (!event) return;

        const adapter = new TableLogic();
        const wasDistanceChanged = adapter.processChange(event, checkpoints, onCheckpointChange);
        if (wasDistanceChanged) {
          distanceChanged = true;
        }
      }
    });

    if (distanceChanged && recheckAllRows) {
      recheckAllRows();
    }
  };
};

export const buildCellRenderer = (checkpoints: CheckpointWithTimes[], idsWithError: Set<number>) => {
  return (row: number, col: number) => {
    const checkpoint = checkpoints[row];
    if (!checkpoint) return {};

    const className = GridEventTranslator.getCellStyling(checkpoint, col, idsWithError);

    return {
      className,
    };
  };
};

export const buildDistanceErrorChecker = (
  hotRef: React.RefObject<HotTableClass | null>,
  setIdsWithError: (errorIds: Set<number>) => void
) => {
  return () => {
    if (!hotRef.current) return;

    const hotInstance = hotRef.current.hotInstance;
    if (!hotInstance) return;

    const gridData = GridEventTranslator.collectDistanceData(
      (row, col) => hotInstance.getDataAtCell(row, col),
      hotInstance.countRows()
    );
    
    const errorIds = TableLogic.checkDistanceErrors(gridData as any);
    setIdsWithError(errorIds);
  };
};

export const buildDebouncedErrorChecker = (
  checkAllRowsForDistanceErrors: () => void,
  recheckTimeoutRef: React.RefObject<number | null>
) => {
  const adapter = new TableLogic();
  const debouncer = adapter.createDebouncer(checkAllRowsForDistanceErrors);
  
  return () => {
    if (recheckTimeoutRef.current) {
      clearTimeout(recheckTimeoutRef.current);
    }
    debouncer.execute();
  };
};

export const buildRowMoveHandler = (
  onReorderCheckpoints?: (newOrder: number[]) => void,
  recheckAllRows?: () => void
) => {
  return (movedRows: number[], finalIndex: number, hotRef: React.RefObject<HotTableClass | null>) => {
    console.log('Row move detected:', { movedRows, finalIndex });
    
    if (!hotRef.current) return;
    
    const hotInstance = hotRef.current.hotInstance;
    if (!hotInstance) return;

    setTimeout(() => {
      const event = GridEventTranslator.translateRowReorder(
        (row, col) => hotInstance.getDataAtCell(row, col),
        hotInstance.countRows()
      );
      
      console.log('New order collected:', event.newOrder);
      const adapter = new TableLogic();
      const processed = adapter.processReorder(event, [], onReorderCheckpoints);
      
      if (processed && recheckAllRows) {
        setTimeout(recheckAllRows, 50);
      }
    }, 10);
  };
};

export const buildRowRemoveHandler = (
  checkpoints: CheckpointWithTimes[],
  onRemoveCheckpoint?: (id: number) => void
) => {
  return (index: number, amount: number, hotRef: React.RefObject<HotTableClass | null>) => {
    console.log('Row remove detected:', { index, amount });
    
    if (!onRemoveCheckpoint || !hotRef.current) return;
    
    const hotInstance = hotRef.current.hotInstance;
    if (!hotInstance) return;

    // 削除処理：表示行数がcheckpoints配列より少ない場合に削除されたアイテムを特定
    const currentRowCount = hotInstance.countRows();
    if (currentRowCount < checkpoints.length) {
      // 最後の行が削除されたと仮定（簡略化）
      const lastCheckpoint = checkpoints[checkpoints.length - 1];
      if (lastCheckpoint) {
        console.log('Removing checkpoint:', lastCheckpoint.id);
        onRemoveCheckpoint(lastCheckpoint.id);
      }
    }
  };
};

export const validateRowRemoval = () => {
  return (index: number) => {
    return GridEventTranslator.validateRowOperation('remove', [index]);
  };
};

export const validateRowMovement = () => {
  return (rows: number[], target: number) => {
    return GridEventTranslator.validateRowOperation('move', rows, target);
  };
};

export const buildRowCreationHandler = (
  onAddCheckpoint?: () => void
) => {
  return () => {
    if (onAddCheckpoint) {
      onAddCheckpoint();
    }
  };
};

export const validateColumnMovement = () => {
  return () => {
    // 全ての列移動を許可
    return true;
  };
};

export const buildColumnMoveHandler = () => {
  return () => {
    // 列移動後の処理（現在は特別な処理なし）
  };
};