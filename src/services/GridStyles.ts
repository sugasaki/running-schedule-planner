export const dataGridStyles = `
  .data-grid-container {
    margin: 20px 0;
    position: relative;
    z-index: 10;
  }
  
  /* グリッドの基本背景を白に設定 */
  .data-grid-container .handsontable td {
    background-color: #ffffff !important;
  }
  
  /* ヘッダーの背景色 */
  .data-grid-container .handsontable .ht_clone_top th,
  .data-grid-container .handsontable .ht_clone_left th,
  .data-grid-container .handsontable .ht_clone_corner th {
    background-color: #f9fafb !important;
  }
  
  /* 区分に応じたセルの背景色 - セル単位で適用 */
  .data-grid-container .handsontable td.has-error {
    background-color: #fee2e2 !important;
  }
  
  .data-grid-container .handsontable td.goal-row {
    background-color: #fefce8 !important;
  }
  
  .data-grid-container .handsontable td.meeting-row {
    background-color: #f0fdf4 !important;
  }
  
  .data-grid-container .handsontable td.start-row {
    background-color: #eff6ff !important;
  }
  
  .data-grid-container .handsontable td.toilet-row {
    background-color: #ffe5ec !important;
  }
  
  /* 読み取り専用セルの背景色 */
  .data-grid-container .handsontable td.htDimmed,
  .data-grid-container .handsontable td.readonly-cell {
    background-color: #f9fafb !important;
    color: #6b7280 !important;
  }
  
  /* 区分別 + 読み取り専用セルの組み合わせ */
  .data-grid-container .handsontable td.goal-row.htDimmed,
  .data-grid-container .handsontable td.goal-row.readonly-cell {
    background-color: #fef3c7 !important;
  }
  
  .data-grid-container .handsontable td.meeting-row.htDimmed,
  .data-grid-container .handsontable td.meeting-row.readonly-cell {
    background-color: #dcfce7 !important;
  }
  
  .data-grid-container .handsontable td.start-row.htDimmed,
  .data-grid-container .handsontable td.start-row.readonly-cell {
    background-color: #dbeafe !important;
  }
  
  .data-grid-container .handsontable td.toilet-row.htDimmed,
  .data-grid-container .handsontable td.toilet-row.readonly-cell {
    background-color: #fecdd3 !important;
  }
  
  .data-grid-container .handsontable td.has-error.htDimmed,
  .data-grid-container .handsontable td.has-error.readonly-cell {
    background-color: #fecaca !important;
  }
`;