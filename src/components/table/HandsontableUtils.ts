import Handsontable from 'handsontable';
import type { CheckpointWithTimes } from '../../types';

export const convertToTableData = (checkpoints: CheckpointWithTimes[]) => {
  return checkpoints.map((checkpoint) => [
    checkpoint.id,
    checkpoint.name,
    checkpoint.type,
    checkpoint.distance,
    checkpoint.pace,
    checkpoint.interval,
    checkpoint.restTime,
    checkpoint.date || '',
    checkpoint.arrivalTime || '',
    checkpoint.departureTime || '',
  ]);
};

export const createAfterChangeHandler = (
  checkpoints: CheckpointWithTimes[],
  onCheckpointChange: (id: number, field: string, value: string | number) => void,
  recheckAllRows?: () => void,
  hotRef?: React.RefObject<any>
) => {
  return (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return;

    let distanceChanged = false;

    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (oldValue !== newValue && row !== null && prop !== null) {
        // HandsontableからIDを取得して正しいcheckpointを特定
        if (!hotRef?.current) {
          return;
        }

        const hotInstance = hotRef.current.hotInstance;
        if (!hotInstance) {
          return;
        }

        // Handsontableの行からIDを取得
        const cellId = hotInstance.getDataAtCell(row, 0); // ID列（0番目）

        // IDでcheckpointを検索
        const checkpoint = checkpoints.find(cp => cp.id === cellId);
        if (!checkpoint) {
          return;
        }

        const fieldMap: { [key: number]: string } = {
          1: 'name',
          2: 'type',
          3: 'distance',
          4: 'pace',
          5: 'interval',
          6: 'restTime',
        };

        const field = fieldMap[prop as number];
        if (field) {
          onCheckpointChange(checkpoint.id, field, newValue);
          
          // 距離が変更された場合はフラグを立てる
          if (field === 'distance') {
            distanceChanged = true;
          }
        }
      }
    });

    // 距離が変更された場合は全行を再チェック（デバウンス付き）
    // デバウンス処理により、連続した距離編集の最後の変更から200ms後に
    // 1回だけチェックが実行される（パフォーマンス最適化 + 状態競合回避）
    if (distanceChanged && recheckAllRows) {
      recheckAllRows();
    }
  };
};

export const createCellsRenderer = (checkpoints: CheckpointWithTimes[], rowsWithError: Set<number>) => {
  return (row: number, col: number) => {
    const checkpoint = checkpoints[row];
    if (!checkpoint) return {};

    let className = '';
    
    // 複数行のエラー状態をチェック
    const hasDistanceError = rowsWithError.has(row);
    
    // 区分に応じたクラス名を追加
    if (hasDistanceError) {
      className += 'has-error ';
    } else if (checkpoint.type === 'ゴール') {
      className += 'goal-row ';
    } else if (checkpoint.type === '集合') {
      className += 'meeting-row ';
    } else if (checkpoint.type === 'スタート') {
      className += 'start-row ';
    } else if (checkpoint.type === 'トイレ') {
      className += 'toilet-row ';
    }

    // 読み取り専用列にhtDimmedクラスを追加
    const readOnlyColumns = [5, 7, 8, 9]; // 間隔、日付、到着、出発
    if (readOnlyColumns.includes(col)) {
      className += 'htDimmed ';
    }

    return {
      className: className.trim(),
    };
  };
};