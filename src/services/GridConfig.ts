export interface DataGridSettings {
  width: string | number;
  height: string | number;
  licenseKey?: string;
  enableSorting: boolean;
  enableRowMove: boolean;
  enableColumnMove: boolean;
  enableColumnResize: boolean;
  enableRowResize: boolean;
  contextMenuOptions: Array<'row_above' | 'row_below' | 'remove_row' | 'col_left' | 'col_right'>;
  stretchMode: 'none' | 'last' | 'all';
}

export interface GridUIConfig {
  showHeaders: {
    column: boolean;
    row: boolean;
  };
  hiddenColumns: number[];
  containerClassName: string;
  addButtonText: string;
  addButtonClassName: string;
}

export class DefaultGridConfig {
  static getDataGridSettings(): DataGridSettings {
    return {
      width: '100%',
      height: '700',
      licenseKey: 'non-commercial-and-evaluation',
      enableSorting: false,
      enableRowMove: true,
      enableColumnMove: true,
      enableColumnResize: true,
      enableRowResize: false,
      contextMenuOptions: ['row_above', 'row_below', 'remove_row', 'col_left', 'col_right'] as const,
      stretchMode: 'all'
    };
  }

  static getGridUIConfig(): GridUIConfig {
    return {
      showHeaders: {
        column: true,
        row: true
      },
      hiddenColumns: [0], // ID列を非表示
      containerClassName: 'data-grid-container relative z-10',
      addButtonText: 'チェックポイント追加',
      addButtonClassName: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
    };
  }

  static getHiddenColumnsConfig() {
    const uiConfig = this.getGridUIConfig();
    return {
      columns: uiConfig.hiddenColumns,
      indicators: false
    };
  }
}