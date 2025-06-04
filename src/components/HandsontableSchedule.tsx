import { useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import type { CheckpointWithTimes } from '../types';

// Register all Handsontable modules
registerAllModules();

interface HandsontableScheduleProps {
  checkpoints: CheckpointWithTimes[];
  onCheckpointChange: (id: number, field: string, value: string | number) => void;
  onAddCheckpoint: () => void;
  onRowMove?: (from: number[], to: number) => void;
}

const HandsontableSchedule: React.FC<HandsontableScheduleProps> = ({
  checkpoints,
  onCheckpointChange,
  onAddCheckpoint,
  onRowMove,
}) => {
  const hotRef = useRef<any>(null);

  // Handsontable用のデータ形式に変換
  const tableData = checkpoints.map((checkpoint) => [
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

  const columns = [
    {
      title: 'No',
      data: 0,
      readOnly: true,
      width: 60,
      className: 'htCenter',
    },
    {
      title: '場所',
      data: 1,
      type: 'text',
      width: 150,
    },
    {
      title: '区分',
      data: 2,
      type: 'dropdown',
      source: ['', '集合', 'スタート', 'コンビニ', '観光', '休憩', 'ゴール', '銭湯', '打上げ'],
      width: 100,
      strict: false,
      allowInvalid: false,
      className: 'htCenter',
    },
    {
      title: '距離(km)',
      data: 3,
      type: 'numeric',
      numericFormat: {
        pattern: '0.00',
      },
      width: 100,
      validator: (value: any, callback: (valid: boolean) => void) => {
        // 距離の検証ロジック（簡略化）
        callback(value >= 0);
      },
    },
    {
      title: 'ペース(分/km)',
      data: 4,
      type: 'numeric',
      numericFormat: {
        pattern: '0.0',
      },
      width: 120,
    },
    {
      title: '間隔(km)',
      data: 5,
      type: 'numeric',
      numericFormat: {
        pattern: '0.00',
      },
      width: 100,
      readOnly: true,
      className: 'htCenter htDimmed',
    },
    {
      title: '休憩(分)',
      data: 6,
      type: 'numeric',
      numericFormat: {
        pattern: '0',
      },
      width: 100,
    },
    {
      title: '日付',
      data: 7,
      readOnly: true,
      width: 100,
      className: 'htCenter htDimmed',
    },
    {
      title: '到着',
      data: 8,
      readOnly: true,
      width: 100,
      className: 'htCenter htDimmed',
    },
    {
      title: '出発',
      data: 9,
      readOnly: true,
      width: 100,
      className: 'htCenter htDimmed',
    },
  ];

  const handleAfterChange = (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return;

    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (oldValue !== newValue && row !== null && prop !== null) {
        const checkpoint = checkpoints[row];
        if (!checkpoint) return;

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
        }
      }
    });
  };

  return (
    <div className="handsontable-container relative z-10">
      <style>{`
        .handsontable-container {
          margin: 20px 0;
          position: relative;
          z-index: 10;
        }
        
        /* グリッドの基本背景を白に設定 */
        .handsontable-container .handsontable td {
          background-color: #ffffff !important;
        }
        
        /* ヘッダーの背景色 */
        .handsontable-container .handsontable .ht_clone_top th,
        .handsontable-container .handsontable .ht_clone_left th,
        .handsontable-container .handsontable .ht_clone_corner th {
          background-color: #f9fafb !important;
        }
        
        /* 区分に応じたセルの背景色 - セル単位で適用 */
        .handsontable-container .handsontable td.has-error {
          background-color: #fef2f2 !important;
        }
        
        .handsontable-container .handsontable td.goal-row {
          background-color: #fefce8 !important;
        }
        
        .handsontable-container .handsontable td.meeting-row {
          background-color: #f0fdf4 !important;
        }
        
        .handsontable-container .handsontable td.start-row {
          background-color: #eff6ff !important;
        }
        
        /* 読み取り専用セルの背景色 */
        .handsontable-container .handsontable td.htDimmed {
          background-color: #f9fafb !important;
          color: #6b7280 !important;
        }
        
        /* 区分別 + 読み取り専用セルの組み合わせ */
        .handsontable-container .handsontable td.goal-row.htDimmed {
          background-color: #fef3c7 !important;
        }
        
        .handsontable-container .handsontable td.meeting-row.htDimmed {
          background-color: #dcfce7 !important;
        }
        
        .handsontable-container .handsontable td.start-row.htDimmed {
          background-color: #dbeafe !important;
        }
        
        .handsontable-container .handsontable td.has-error.htDimmed {
          background-color: #fee2e2 !important;
        }
      `}</style>

      <HotTable
        ref={hotRef}
        data={tableData}
        columns={columns}
        colHeaders={true}
        rowHeaders={true}
        width="100%"
        height="600"
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
        afterRowMove={(rows: number[], target: number) => {
          // 行移動後にcheckpointsの順序を更新
          console.log('Row moved:', rows, 'to', target);
          if (onRowMove) {
            onRowMove(rows, target);
          }
        }}
        afterColumnMove={(columns: number[], target: number) => {
          // 列移動後の処理
          console.log('Column moved:', columns, 'to', target);
        }}
        cells={(row: number, col: number) => {
          const checkpoint = checkpoints[row];
          if (!checkpoint) return {};

          let className = '';
          
          // 区分に応じたクラス名を追加
          if (checkpoint.hasError) {
            className += 'has-error ';
          } else if (checkpoint.type === 'ゴール') {
            className += 'goal-row ';
          } else if (checkpoint.type === '集合') {
            className += 'meeting-row ';
          } else if (checkpoint.type === 'スタート') {
            className += 'start-row ';
          }

          // 読み取り専用列にhtDimmedクラスを追加
          const readOnlyColumns = [5, 7, 8, 9]; // 間隔、日付、到着、出発
          if (readOnlyColumns.includes(col)) {
            className += 'htDimmed ';
          }

          return {
            className: className.trim(),
          };
        }}
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