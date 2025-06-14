import { CheckpointGridSchema } from './GridSchema';

export interface GridColumnConfig {
  key: string;
  title: string;
  dataIndex: number;
  type: 'text' | 'numeric' | 'dropdown' | 'readonly';
  width: number;
  readOnly?: boolean;
  className?: string;
  numericFormat?: {
    pattern: string;
  };
  dropdownSource?: string[];
  dropdownStrict?: boolean;
  allowInvalid?: boolean;
  validator?: (value: unknown, rowIndex: number, getCellValue: (row: number, col: number) => unknown) => boolean;
}

export class GridColumnConfigFactory {
  static createCheckpointColumns(): GridColumnConfig[] {
    return [
      {
        key: CheckpointGridSchema.COLUMN_KEYS.ID,
        title: 'ID',
        dataIndex: 0,
        type: 'readonly',
        width: 50,
        readOnly: true,
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.NAME,
        title: '場所',
        dataIndex: 1,
        type: 'text',
        width: 150,
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.TYPE,
        title: '区分',
        dataIndex: 2,
        type: 'dropdown',
        width: 100,
        dropdownSource: ['', ...Object.values(CheckpointGridSchema.CHECKPOINT_TYPES)],
        dropdownStrict: false,
        allowInvalid: false,
        className: 'center-align',
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.DISTANCE,
        title: '距離(km)',
        dataIndex: 3,
        type: 'numeric',
        width: 100,
        numericFormat: { pattern: '0.00' },
        validator: (value, rowIndex, getCellValue) => {
          // 基本的な負数チェック
          if (typeof value !== 'number' || value < 0) {
            return false;
          }

          // 見た目の順序での検証（前の行より大きいかチェック）
          if (rowIndex > 1) {
            const prevDistance = getCellValue(rowIndex - 1, 3);
            if (typeof prevDistance === 'number' && value < prevDistance) {
              return false;
            }
          }

          return true;
        },
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.PACE,
        title: 'ペース(分/km)',
        dataIndex: 4,
        type: 'numeric',
        width: 120,
        numericFormat: { pattern: '0.0' },
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.INTERVAL,
        title: '間隔(km)',
        dataIndex: 5,
        type: 'readonly',
        width: 100,
        readOnly: true,
        numericFormat: { pattern: '0.00' },
        className: 'center-align readonly-cell',
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.REST_TIME,
        title: '休憩(分)',
        dataIndex: 6,
        type: 'numeric',
        width: 100,
        numericFormat: { pattern: '0' },
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.DATE,
        title: '日付',
        dataIndex: 7,
        type: 'readonly',
        width: 100,
        readOnly: true,
        className: 'center-align readonly-cell',
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.ARRIVAL_TIME,
        title: '到着',
        dataIndex: 8,
        type: 'readonly',
        width: 100,
        readOnly: true,
        className: 'center-align readonly-cell',
      },
      {
        key: CheckpointGridSchema.COLUMN_KEYS.DEPARTURE_TIME,
        title: '出発',
        dataIndex: 9,
        type: 'readonly',
        width: 100,
        readOnly: true,
        className: 'center-align readonly-cell',
      },
    ];
  }
}