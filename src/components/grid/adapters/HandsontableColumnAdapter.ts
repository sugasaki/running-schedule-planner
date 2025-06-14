import type { HotTableClass } from '@handsontable/react';
import type Handsontable from 'handsontable';
import type { Checkpoint } from '../../../types';
import { GridColumnConfigFactory, type GridColumnConfig } from '../../../services/GridColumnConfig';

export class HandsontableColumnAdapter {
  static createColumnSettings(
    gridRef: React.RefObject<HotTableClass | null>, 
_checkpoints?: Checkpoint[]
  ): Handsontable.ColumnSettings[] {
    const genericColumns = GridColumnConfigFactory.createCheckpointColumns();
    
    return genericColumns.map(col => this.convertToHandsontableColumn(col, gridRef));
  }

  private static convertToHandsontableColumn(
    config: GridColumnConfig,
    gridRef: React.RefObject<HotTableClass | null>
  ): Handsontable.ColumnSettings {
    const baseSettings: Handsontable.ColumnSettings = {
      title: config.title,
      data: config.dataIndex,
      width: config.width,
      readOnly: config.readOnly,
    };

    // クラス名のマッピング
    if (config.className) {
      baseSettings.className = this.mapClassName(config.className);
    }

    // タイプ別設定
    switch (config.type) {
      case 'text':
        baseSettings.type = 'text';
        break;
        
      case 'numeric':
        baseSettings.type = 'numeric';
        if (config.numericFormat) {
          baseSettings.numericFormat = config.numericFormat;
        }
        break;
        
      case 'dropdown':
        baseSettings.type = 'dropdown';
        baseSettings.source = config.dropdownSource;
        baseSettings.strict = config.dropdownStrict;
        baseSettings.allowInvalid = config.allowInvalid;
        break;
        
      case 'readonly':
        baseSettings.readOnly = true;
        break;
    }

    // バリデーター
    if (config.validator) {
      baseSettings.validator = function(value: unknown, callback: (valid: boolean) => void) {
        // @ts-ignore - Handsontableのthisコンテキストからrow/colを取得
        const row = this.row;
        
        const getCellValue = (r: number, c: number) => {
          if (gridRef.current?.hotInstance) {
            return gridRef.current.hotInstance.getDataAtCell(r, c);
          }
          return null;
        };

        const isValid = config.validator!(value, row, getCellValue);
        callback(isValid);
      };
    }

    return baseSettings;
  }

  private static mapClassName(genericClassName: string): string {
    const classMap: Record<string, string> = {
      'center-align': 'htCenter',
      'readonly-cell': 'htDimmed',
    };

    return genericClassName
      .split(' ')
      .map(cls => classMap[cls] || cls)
      .join(' ');
  }
}