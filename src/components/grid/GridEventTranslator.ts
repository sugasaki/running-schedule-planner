import type { GridChangeEvent, GridReorderEvent } from '../../services/TableLogic';
import { CheckpointGridSchema } from '../../services/GridSchema';

export class GridEventTranslator {
  /**
   * データグリッドの列インデックスからグリッドイベントに変換
   */
  static translateCellChange(
    rowIndex: number,
    columnIndex: number,
    oldValue: unknown,
    newValue: unknown
  ): GridChangeEvent | null {
    const columnDef = CheckpointGridSchema.getColumnByIndex(columnIndex);
    if (!columnDef) return null;

    return {
      rowIndex,
      columnKey: columnDef.key,
      oldValue,
      newValue
    };
  }

  /**
   * データグリッドの行順序からグリッドイベントに変換
   */
  static translateRowReorder(
    getCellValue: (row: number, col: number) => unknown,
    totalRows: number
  ): GridReorderEvent {
    const newOrder: number[] = [];
    const idColumnIndex = CheckpointGridSchema.getColumnIndex(CheckpointGridSchema.COLUMN_KEYS.ID);
    
    for (let i = 0; i < totalRows; i++) {
      const id = getCellValue(i, idColumnIndex);
      if (id !== null && typeof id === 'number') {
        newOrder.push(id);
      }
    }
    
    return { newOrder };
  }

  /**
   * 距離エラーチェック用のデータ収集
   */
  static collectDistanceData(
    getCellValue: (row: number, col: number) => unknown,
    totalRows: number
  ): Array<{ id: number; distance: number }> {
    const gridData: Array<{ id: number; distance: number }> = [];
    const distanceColumnIndex = CheckpointGridSchema.getColumnIndex(CheckpointGridSchema.COLUMN_KEYS.DISTANCE);
    const idColumnIndex = CheckpointGridSchema.getColumnIndex(CheckpointGridSchema.COLUMN_KEYS.ID);
    
    for (let i = 0; i < totalRows; i++) {
      const id = getCellValue(i, idColumnIndex);
      const distance = getCellValue(i, distanceColumnIndex);
      
      if (typeof id === 'number' && typeof distance === 'number') {
        gridData.push({ id, distance });
      }
    }
    
    return gridData;
  }

  /**
   * 移動・削除バリデーション
   */
  static validateRowOperation(
    operationType: 'move' | 'remove',
    sourceRows: number[],
    targetIndex?: number
  ): boolean {
    switch (operationType) {
      case 'move':
        if (targetIndex === undefined) return false;
        return CheckpointGridSchema.isProtectedRow(targetIndex) === false &&
               sourceRows.every(row => !CheckpointGridSchema.isProtectedRow(row));
      
      case 'remove':
        return sourceRows.every(row => !CheckpointGridSchema.isProtectedRow(row));
      
      default:
        return false;
    }
  }

  /**
   * セルスタイリング情報を取得
   */
  static getCellStyling(
    checkpoint: { id: number; type: string },
    columnIndex: number,
    idsWithError: Set<number>
  ): string {
    let className = '';
    
    // エラー状態チェック
    if (idsWithError.has(checkpoint.id)) {
      className += 'has-error ';
    } else {
      // チェックポイント種別によるスタイリング
      const typeClassMap = {
        [CheckpointGridSchema.CHECKPOINT_TYPES.GOAL]: 'goal-row ',
        [CheckpointGridSchema.CHECKPOINT_TYPES.MEETING]: 'meeting-row ',
        [CheckpointGridSchema.CHECKPOINT_TYPES.START]: 'start-row ',
        [CheckpointGridSchema.CHECKPOINT_TYPES.TOILET]: 'toilet-row ',
      };
      className += typeClassMap[checkpoint.type as keyof typeof typeClassMap] || '';
    }

    // 読み取り専用列のスタイリング
    const columnDef = CheckpointGridSchema.getColumnByIndex(columnIndex);
    if (columnDef && CheckpointGridSchema.isReadOnlyColumn(columnDef.key)) {
      className += 'readonly-cell ';
    }

    return className.trim();
  }
}