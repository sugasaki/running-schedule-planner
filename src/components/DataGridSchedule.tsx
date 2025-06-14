import { useRef, useState } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import type { CheckpointWithTimes } from '../types';
import { HandsontableColumnAdapter } from './grid/adapters/HandsontableColumnAdapter';
import { dataGridStyles } from '../services/GridStyles';
import { DefaultGridConfig } from '../services/GridConfig';
import {
  transformCheckpointsToTableData,
  buildCellChangeHandler,
  buildCellRenderer,
  buildRowMoveHandler,
  buildRowRemoveHandler,
  validateRowRemoval,
  validateRowMovement,
  buildRowCreationHandler,
  validateColumnMovement,
  buildColumnMoveHandler,
  buildDistanceErrorChecker,
  buildDebouncedErrorChecker
} from './grid/adapters/HandsontableUtils';

// Register all Handsontable modules
registerAllModules();

interface DataGridScheduleProps {
  checkpoints: CheckpointWithTimes[];
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  onAddCheckpoint: () => void;
  onRemoveCheckpoint?: (id: number) => void;
  onReorderCheckpoints?: (newOrder: number[]) => void;
}

const DataGridSchedule: React.FC<DataGridScheduleProps> = ({
  checkpoints,
  onCheckpointChange,
  onAddCheckpoint,
  onRemoveCheckpoint,
  onReorderCheckpoints,
}) => {
  const gridRef = useRef<HotTableClass | null>(null);
  const [idsWithError, setIdsWithError] = useState<Set<number>>(new Set());
  const recheckTimeoutRef = useRef<number | null>(null);

  // 全行の距離チェック処理
  const checkAllRowsForDistanceErrors = buildDistanceErrorChecker(gridRef, setIdsWithError);
  
  // デバウンス付きの全行チェック処理
  const debouncedCheckAllRows = buildDebouncedErrorChecker(checkAllRowsForDistanceErrors, recheckTimeoutRef);

  // グリッド設定を取得
  const gridSettings = DefaultGridConfig.getDataGridSettings();
  const uiConfig = DefaultGridConfig.getGridUIConfig();
  const hiddenColumnsConfig = DefaultGridConfig.getHiddenColumnsConfig();

  const tableData = transformCheckpointsToTableData(checkpoints);
  const columns = HandsontableColumnAdapter.createColumnSettings(gridRef, checkpoints);
  const handleAfterChange = buildCellChangeHandler(checkpoints, onCheckpointChange, debouncedCheckAllRows, gridRef);
  const cellsRenderer = buildCellRenderer(checkpoints, idsWithError);
  const handleAfterRowMove = buildRowMoveHandler(onReorderCheckpoints, checkAllRowsForDistanceErrors);
  const handleAfterRemoveRow = buildRowRemoveHandler(checkpoints, onRemoveCheckpoint);
  const handleBeforeRemoveRow = validateRowRemoval();
  const handleBeforeRowMove = validateRowMovement();
  const handleAfterCreateRow = buildRowCreationHandler(onAddCheckpoint);
  const handleBeforeColumnMove = validateColumnMovement();
  const handleAfterColumnMove = buildColumnMoveHandler();

  return (
    <div className={uiConfig.containerClassName}>
      <style>{dataGridStyles}</style>

      <HotTable
        ref={gridRef}
        data={tableData}
        columns={columns}
        colHeaders={uiConfig.showHeaders.column}
        rowHeaders={uiConfig.showHeaders.row}
        width={gridSettings.width}
        height={gridSettings.height}
        licenseKey={gridSettings.licenseKey}
        stretchH={gridSettings.stretchMode}
        columnSorting={gridSettings.enableSorting}
        contextMenu={gridSettings.contextMenuOptions}
        manualRowMove={gridSettings.enableRowMove}
        manualColumnMove={gridSettings.enableColumnMove}
        manualColumnResize={gridSettings.enableColumnResize}
        manualRowResize={gridSettings.enableRowResize}
        hiddenColumns={hiddenColumnsConfig}
        afterChange={handleAfterChange}
        beforeRemoveRow={handleBeforeRemoveRow}
        afterRemoveRow={(index: number, amount: number) => {
          handleAfterRemoveRow(index, amount, gridRef);
        }}
        beforeColumnMove={handleBeforeColumnMove}
        beforeRowMove={handleBeforeRowMove}
        afterCreateRow={handleAfterCreateRow}
        afterRowMove={(movedRows: number[], finalIndex: number) => {
          handleAfterRowMove(movedRows, finalIndex, gridRef);
        }}
        afterColumnMove={handleAfterColumnMove}
        cells={cellsRenderer}
      />

      <div className="mt-4 space-x-2">
        <button
          onClick={onAddCheckpoint}
          className={uiConfig.addButtonClassName}
        >
          {uiConfig.addButtonText}
        </button>
      </div>
    </div>
  );
};

export default DataGridSchedule;