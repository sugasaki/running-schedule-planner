import { useRef, useState } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import type { CheckpointWithTimes } from '../types';
import { createColumnConfig } from './table/HandsontableConfig';
import { handsontableStyles } from './table/HandsontableStyles';
import {
  convertToTableData,
  createAfterChangeHandler,
  createCellsRenderer
} from './table/HandsontableUtils';

// Register all Handsontable modules
registerAllModules();

interface HandsontableScheduleProps {
  checkpoints: CheckpointWithTimes[];
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  onAddCheckpoint: () => void;
}

const HandsontableSchedule: React.FC<HandsontableScheduleProps> = ({
  checkpoints,
  onCheckpointChange,
  onAddCheckpoint,
}) => {
  const hotRef = useRef<HotTableClass | null>(null);
  const [rowsWithError, setRowsWithError] = useState<Set<number>>(new Set());
  const recheckTimeoutRef = useRef<number | null>(null);

  // 全行の距離チェック処理
  const checkAllRowsForDistanceErrors = () => {
    if (!hotRef.current) return;

    const hotInstance = hotRef.current.hotInstance;
    if (!hotInstance) return;

    const errorRows = new Set<number>();
    const rowCount = hotInstance.countRows();

    // 3行目以降（インデックス2以降）をチェック
    for (let row = 2; row < rowCount; row++) {
      const currentDistance = hotInstance.getDataAtCell(row, 3);
      const prevDistance = hotInstance.getDataAtCell(row - 1, 3);

      if (currentDistance !== null && prevDistance !== null && currentDistance < prevDistance) {
        // エラーがある行のIDを取得してcheckpoints配列でのインデックスを取得
        const rowId = hotInstance.getDataAtCell(row, 0);
        const checkpointIndex = checkpoints.findIndex(cp => cp.id === rowId);

        if (checkpointIndex !== -1) {
          errorRows.add(checkpointIndex);
        }
      }
    }
    setRowsWithError(errorRows);
  };

  // デバウンス付きの全行チェック処理
  // タイマーを使用する理由：
  // 1. 連続した距離編集時の不要な処理実行を防止（パフォーマンス最適化）
  // 2. React状態更新（setCheckpoints）との競合を回避
  // 3. ユーザーの編集完了まで待機してから最終状態をチェック
  // 4. 200msは一般的なタイピング間隔で、体感的に即座に反応する範囲
  const debouncedCheckAllRows = () => {
    // 既存のタイマーをクリア（新しい編集があった場合は前の処理をキャンセル）
    if (recheckTimeoutRef.current) {
      clearTimeout(recheckTimeoutRef.current);
    }

    // 新しいタイマーを設定（200ms後に実行）
    // これにより連続した編集の最後の変更から200ms後に1回だけチェックが実行される
    recheckTimeoutRef.current = setTimeout(() => {
      checkAllRowsForDistanceErrors();
    }, 200);
  };

  const tableData = convertToTableData(checkpoints);
  const columns = createColumnConfig(hotRef);
  const handleAfterChange = createAfterChangeHandler(checkpoints, onCheckpointChange, debouncedCheckAllRows, hotRef);
  const cellsRenderer = createCellsRenderer(checkpoints, rowsWithError);

  return (
    <div className="handsontable-container relative z-10">
      <style>{handsontableStyles}</style>

      <HotTable
        ref={hotRef}
        data={tableData}
        columns={columns}
        colHeaders={true}
        rowHeaders={true}
        width="100%"
        height="700"
        licenseKey="non-commercial-and-evaluation"
        stretchH="all"
        columnSorting={false}
        contextMenu={['row_above', 'row_below', 'remove_row', 'col_left', 'col_right']}
        manualRowMove={true}
        manualColumnMove={true}
        manualColumnResize={true}
        manualRowResize={false}
        afterChange={handleAfterChange}
        beforeRemoveRow={(index: number) => {
          // 最初の2行（集合、スタート）は削除不可
          return index >= 2;
        }}
        beforeColumnMove={(columns: number[]) => {
          // No列（最初の列）は移動不可
          return !columns.includes(0);
        }}
        beforeRowMove={(rows: number[], target: number) => {
          // 最初の2行（集合、スタート）は移動不可
          // また、最初の2行の位置に移動することも不可
          const hasProtectedRows = rows.some(row => row < 2);
          const targetInProtectedArea = target < 2;

          if (hasProtectedRows || targetInProtectedArea) {
            return false;
          }

          return true;
        }}
        afterCreateRow={() => {
          onAddCheckpoint();
        }}
        afterRowMove={() => {
          // 行移動後に全行をチェック
          checkAllRowsForDistanceErrors();
        }}
        afterColumnMove={() => {
          // 列移動後の処理（現在は特別な処理なし）
        }}
        cells={cellsRenderer}
      />

      <div className="mt-4 space-x-2">
        <button
          onClick={onAddCheckpoint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          チェックポイント追加
        </button>
      </div>
    </div>
  );
};

export default HandsontableSchedule;