export interface IDataGridAdapter<TData, TChangeEvent, TReorderEvent, TRemoveEvent> {
  convertToGridFormat(data: TData[]): unknown[][];
  processChange(event: TChangeEvent, data: TData[], onChange: (id: number, field: string, value: string | number) => void): boolean;
  processReorder(event: TReorderEvent, data: TData[], onReorder?: (newOrder: number[]) => void): boolean;
  processRemove(event: TRemoveEvent, data: TData[], onRemove?: (id: number) => void): void;
  checkDataIntegrity(data: TData[]): Set<number>;
  validateMove(sourceIndices: number[], targetIndex: number): boolean;
  validateRemove(index: number): boolean;
  createDebouncer(callback: () => void, delay?: number): { execute: () => void; cancel: () => void; cleanup: () => void };
}