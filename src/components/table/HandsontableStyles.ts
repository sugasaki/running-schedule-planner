export const handsontableStyles = `
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
    background-color: #fee2e2 !important;
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
  
  .handsontable-container .handsontable td.toilet-row {
    background-color: #ffe5ec !important;
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
  
  .handsontable-container .handsontable td.toilet-row.htDimmed {
    background-color: #fecdd3 !important;
  }
  
  .handsontable-container .handsontable td.has-error.htDimmed {
    background-color: #fecaca !important;
  }
`;