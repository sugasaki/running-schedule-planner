export interface ColumnDefinition {
  key: string;
  header: string;
  type: 'text' | 'number' | 'select' | 'readonly';
  width?: number;
  options?: string[];
  validator?: (value: unknown) => boolean;
  formatter?: (value: unknown) => string;
}

export interface GridSchema {
  columns: ColumnDefinition[];
  protectedRows: number[];
  protectedColumns: string[];
  hiddenColumns: string[];
}

export class CheckpointGridSchema {
  static readonly COLUMN_KEYS = {
    ID: 'id',
    NAME: 'name',
    TYPE: 'type', 
    DISTANCE: 'distance',
    PACE: 'pace',
    INTERVAL: 'interval',
    REST_TIME: 'restTime',
    DATE: 'date',
    ARRIVAL_TIME: 'arrivalTime',
    DEPARTURE_TIME: 'departureTime'
  } as const;

  static readonly CHECKPOINT_TYPES = {
    MEETING: '集合',
    START: 'スタート',
    TOILET: 'トイレ',
    CONVENIENCE: 'コンビニ',
    SIGHTSEEING: '観光',
    REST: '休憩',
    GOAL: 'ゴール',
    BATH: '銭湯',
    PARTY: '打上げ'
  } as const;

  static readonly PROTECTED_TYPES = [
    CheckpointGridSchema.CHECKPOINT_TYPES.MEETING,
    CheckpointGridSchema.CHECKPOINT_TYPES.START
  ];

  static createSchema(): GridSchema {
    return {
      columns: [
        {
          key: CheckpointGridSchema.COLUMN_KEYS.ID,
          header: 'ID',
          type: 'readonly',
          width: 50
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.NAME,
          header: '場所',
          type: 'text',
          width: 200
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.TYPE,
          header: '区分',
          type: 'select',
          width: 100,
          options: Object.values(CheckpointGridSchema.CHECKPOINT_TYPES)
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.DISTANCE,
          header: '距離(km)',
          type: 'number',
          width: 100,
          validator: (value: unknown) => typeof value === 'number' && value >= 0
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.PACE,
          header: 'ペース(分/km)',
          type: 'number',
          width: 120,
          validator: (value: unknown) => typeof value === 'number' && value > 0
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.INTERVAL,
          header: '間隔(km)',
          type: 'readonly',
          width: 100,
          formatter: (value: unknown) => typeof value === 'number' ? value.toFixed(2) : '0.00'
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.REST_TIME,
          header: '休憩(分)',
          type: 'number',
          width: 100,
          validator: (value: unknown) => typeof value === 'number' && value >= 0
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.DATE,
          header: '日付',
          type: 'readonly',
          width: 80
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.ARRIVAL_TIME,
          header: '到着',
          type: 'readonly',
          width: 80
        },
        {
          key: CheckpointGridSchema.COLUMN_KEYS.DEPARTURE_TIME,
          header: '出発',
          type: 'readonly',
          width: 80
        }
      ],
      protectedRows: [0, 1], // 集合・スタート行
      protectedColumns: [
        CheckpointGridSchema.COLUMN_KEYS.ID,
        CheckpointGridSchema.COLUMN_KEYS.INTERVAL,
        CheckpointGridSchema.COLUMN_KEYS.DATE,
        CheckpointGridSchema.COLUMN_KEYS.ARRIVAL_TIME,
        CheckpointGridSchema.COLUMN_KEYS.DEPARTURE_TIME
      ],
      hiddenColumns: [CheckpointGridSchema.COLUMN_KEYS.ID]
    };
  }

  static getColumnIndex(columnKey: string): number {
    const schema = CheckpointGridSchema.createSchema();
    return schema.columns.findIndex(col => col.key === columnKey);
  }

  static getColumnByIndex(index: number): ColumnDefinition | undefined {
    const schema = CheckpointGridSchema.createSchema();
    return schema.columns[index];
  }

  static isProtectedRow(rowIndex: number): boolean {
    const schema = CheckpointGridSchema.createSchema();
    return schema.protectedRows.includes(rowIndex);
  }

  static isReadOnlyColumn(columnKey: string): boolean {
    const schema = CheckpointGridSchema.createSchema();
    return schema.protectedColumns.includes(columnKey);
  }

  static isProtectedType(checkpointType: string): boolean {
    return CheckpointGridSchema.PROTECTED_TYPES.includes(checkpointType as any);
  }

  static getEditableColumnKeys(): string[] {
    const schema = CheckpointGridSchema.createSchema();
    return schema.columns
      .filter(col => !schema.protectedColumns.includes(col.key))
      .map(col => col.key);
  }

  static validateDistanceOrder(currentDistance: number, previousDistance: number): boolean {
    return currentDistance >= previousDistance;
  }

  static getMinimumCheckRowIndex(): number {
    // 集合・スタート行の次から距離チェックを開始
    return CheckpointGridSchema.createSchema().protectedRows.length + 1;
  }
}