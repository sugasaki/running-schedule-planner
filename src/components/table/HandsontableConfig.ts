import type { HotTableClass } from '@handsontable/react';
import type Handsontable from 'handsontable';

export const createColumnConfig = (hotRef: React.RefObject<HotTableClass | null>): Handsontable.ColumnSettings[] => [
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
    source: ['', '集合', 'スタート', 'トイレ', 'コンビニ', '観光', '休憩', 'ゴール', '銭湯', '打上げ'],
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
    validator: function(value: any, callback: (valid: boolean) => void) {
      // 基本的な負数チェック
      if (value < 0) {
        callback(false);
        return;
      }

      // @ts-ignore - Handsontableのthisコンテキストからrow/colを取得
      const row = this.row;
      
      // 行移動後の距離チェック（前の行の距離より大きいかチェック）
      if (row > 1 && hotRef.current) {
        const hotInstance = hotRef.current.hotInstance;
        if (hotInstance) {
          const prevRowDistance = hotInstance.getDataAtCell(row - 1, 3);
          if (prevRowDistance !== null && value < prevRowDistance) {
            callback(false);
            return;
          }
        }
      }

      callback(true);
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