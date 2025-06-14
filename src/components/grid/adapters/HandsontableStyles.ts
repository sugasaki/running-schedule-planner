import { dataGridStyles } from '../../../services/GridStyles';

// Handsontable固有の追加スタイル（必要に応じて）
const handsontableSpecificStyles = `
  /* Handsontable固有の追加スタイルがあればここに記述 */
`;

export const handsontableStyles = dataGridStyles + handsontableSpecificStyles;